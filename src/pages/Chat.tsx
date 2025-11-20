import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Menu, ArrowLeft, Paperclip, Mic, MicOff, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileText, setUploadedFileText] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [userLanguage, setUserLanguage] = useState('English');
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserLanguage();
      initializeConversation();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchUserLanguage = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('user_id', user.id)
        .single();
      
      if (data?.preferred_language) {
        setUserLanguage(data.preferred_language);
      }
    } catch (error) {
      console.error('Error fetching user language:', error);
    }
  };

  const initializeConversation = async () => {
    if (!user) return;

    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (conversations && conversations.length > 0) {
        const conv = conversations[0];
        setConversationId(conv.id);
        await loadMessages(conv.id);
      } else {
        await createNewConversation();
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const createNewConversation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: 'New Chat' })
        .select()
        .single();

      if (error) throw error;
      setConversationId(data.id);
      
      // Add greeting message
      await addGreetingMessage(data.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const addGreetingMessage = async (convId: string) => {
    const greetings: Record<string, string> = {
      English: "Hi! I'm your AI Health Coach. I'm here to support your wellness journey. How can I help you today?",
      Hindi: "नमस्ते! मैं आपका AI स्वास्थ्य कोच हूं। मैं आपकी स्वास्थ्य यात्रा में आपका साथ देने के लिए यहां हूं। मैं आज आपकी कैसे मदद कर सकता हूं?",
      Spanish: "¡Hola! Soy tu entrenador de salud de IA. Estoy aquí para apoyar tu viaje de bienestar. ¿Cómo puedo ayudarte hoy?",
      French: "Bonjour! Je suis votre coach santé IA. Je suis là pour soutenir votre parcours de bien-être. Comment puis-je vous aider aujourd'hui?",
      German: "Hallo! Ich bin Ihr KI-Gesundheitscoach. Ich bin hier, um Ihre Wellness-Reise zu unterstützen. Wie kann ich Ihnen heute helfen?"
    };

    const greeting = greetings[userLanguage] || greetings.English;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          role: 'assistant',
          content: greeting,
        });

      if (error) throw error;
      
      // Reload messages to show greeting
      await loadMessages(convId);
    } catch (error) {
      console.error('Error adding greeting:', error);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
      
      // Add greeting if no messages
      if (!data || data.length === 0) {
        await addGreetingMessage(convId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!conversationId || !user) return;
    
    // If there's a file but no input, send the file
    if (uploadedFileText && !input.trim()) {
      await sendMessageWithFile(uploadedFileText, uploadedFileName || 'file');
      return;
    }
    
    if (!input.trim()) return;

    const userMessage = input.trim();
    
    // Validate message content
    const { messageSchema } = await import("@/lib/validation");
    const validationResult = messageSchema.safeParse({ content: userMessage });
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setInput('');
    setIsLoading(true);

    try {
      // Include file text with compact formatting
      let finalContent = validationResult.data.content;
      if (uploadedFileText && uploadedFileName) {
        // User's question about the file with compact context
        finalContent = `Q: ${validationResult.data.content}

Document: ${uploadedFileName}
${uploadedFileText}`;
      }

      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: finalContent,
        });

      if (insertError) throw insertError;

      const newUserMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: finalContent,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newUserMsg]);
      
      // Clear file state after sending
      setUploadedFileText(null);
      setUploadedFileName(null);

      const allMessages = [...messages, newUserMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: allMessages,
            conversationId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMsgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          created_at: new Date().toISOString(),
        },
      ]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch (e) {
            console.error('Error parsing SSE:', e);
          }
        }
      }

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantContent,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingFile(true);
    try {
      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Extract text from file
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const extractResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-file-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileUrl: fileName,
            fileName: file.name,
          }),
        }
      );

      if (!extractResponse.ok) throw new Error('Failed to extract text');

      const { text } = await extractResponse.json();

      // Limit text length - keep it conservative to leave room for user questions and prompt
      const MAX_CHARS = 8000;
      let processedText = text;
      let wasTruncated = false;
      
      if (text.length > MAX_CHARS) {
        // For very large files, take content from beginning, middle, and end
        const chunkSize = Math.floor(MAX_CHARS / 3);
        const start = text.substring(0, chunkSize);
        const middle = text.substring(Math.floor(text.length / 2) - chunkSize / 2, Math.floor(text.length / 2) + chunkSize / 2);
        const end = text.substring(text.length - chunkSize);
        
        processedText = `${start}\n\n[... content trimmed ...]\n\n${middle}\n\n[... content trimmed ...]\n\n${end}`;
        wasTruncated = true;
      }

      // Store extracted text and filename
      setUploadedFileText(processedText);
      setUploadedFileName(file.name);

      if (wasTruncated) {
        toast.success(`File uploaded! Large document summarized to key sections.`);
      } else {
        toast.success('File uploaded! Type a message or send directly.');
      }
      
      // Auto-send if no input text
      if (!input.trim()) {
        setTimeout(() => {
          sendMessageWithFile(text, file.name);
        }, 500);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to process file');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sendMessageWithFile = async (fileText: string, fileName: string) => {
    if (!conversationId || !user) return;

    setIsLoading(true);

    try {
      // Compact prompt for large files
      const userContent = `Uploaded: ${fileName}

Analyze and provide:
1. Summary
2. Key findings
3. Important values
4. Recommendations
5. Prevention tips

Content:
${fileText}`;
      
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: userContent,
        });

      if (insertError) throw insertError;

      const newUserMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userContent,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newUserMsg]);

      const allMessages = [...messages, newUserMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: allMessages,
            conversationId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMsgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          created_at: new Date().toISOString(),
        },
      ]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch (e) {
            console.error('Error parsing SSE:', e);
          }
        }
      }

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantContent,
      });

      // Clear file state
      setUploadedFileText(null);
      setUploadedFileName(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      await new Promise((resolve) => {
        reader.onloadend = resolve;
      });

      const base64Audio = (reader.result as string).split(',')[1];

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ audio: base64Audio }),
        }
      );

      if (!response.ok) throw new Error('Failed to transcribe audio');

      const { text } = await response.json();
      setInput(text);
      toast.success('Audio transcribed!');
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 bg-primary text-primary-foreground shadow-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">AI Assistant</h1>
          <p className="text-xs opacity-90">Online</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary/90"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 items-end ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-lg">🩺</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 items-end justify-start">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-lg">🩺</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-2">
          {(isTranscribing || uploadingFile) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isTranscribing ? 'Transcribing audio...' : 'Processing file...'}</span>
            </div>
          )}
          {uploadedFileName && !uploadingFile && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg text-sm">
              <Paperclip className="h-4 w-4 text-primary" />
              <span className="text-foreground">{uploadedFileName} ready</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadedFileText(null);
                  setUploadedFileName(null);
                }}
                className="ml-auto h-6 px-2"
              >
                Remove
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || uploadingFile || isTranscribing}
              className="h-[50px] w-[50px] rounded-full shrink-0"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading || uploadingFile || isTranscribing}
              className={`h-[50px] w-[50px] rounded-full shrink-0 ${
                isRecording ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[50px] max-h-[150px] resize-none flex-1"
              disabled={isLoading || isRecording}
            />
            <Button
              onClick={sendMessage}
              disabled={(!input.trim() && !uploadedFileText) || isLoading || isRecording}
              size="icon"
              className="h-[50px] w-[50px] rounded-full shrink-0 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
