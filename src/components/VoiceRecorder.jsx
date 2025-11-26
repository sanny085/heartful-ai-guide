import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function VoiceRecorder({ onTranscriptionComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Your browser doesn't support audio recording. Please use a modern browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      
      // Provide specific error messages based on error type
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast.error("Microphone access denied. Please enable microphone permissions in your browser settings.");
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        toast.error("No microphone found. Please connect a microphone and try again.");
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        toast.error("Microphone is already in use by another application.");
      } else if (error.name === 'SecurityError') {
        toast.error("Microphone access blocked. If using HTTPS, check your browser's security settings.");
      } else {
        toast.error("Failed to start recording. Please check your microphone and try again.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing audio...");
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      await new Promise((resolve) => {
        reader.onloadend = resolve;
      });

      const base64Audio = reader.result.split(',')[1];

      // Call edge function to transcribe
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      if (data?.text) {
        onTranscriptionComplete(data.text);
        toast.success("Audio transcribed successfully!");
      } else {
        throw new Error("No transcription received");
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast.error("Failed to transcribe audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording && !isTranscribing && (
        <Button
          type="button"
          variant="outline"
          onClick={startRecording}
          className="flex items-center gap-2"
        >
          <Mic className="w-4 h-4" />
          Record Voice Note
        </Button>
      )}
      
      {isRecording && (
        <Button
          type="button"
          variant="destructive"
          onClick={stopRecording}
          className="flex items-center gap-2 animate-pulse"
        >
          <Square className="w-4 h-4" />
          Stop Recording
        </Button>
      )}

      {isTranscribing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Transcribing...
        </div>
      )}
    </div>
  );
}