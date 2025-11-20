import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's preferred language
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_language')
      .eq('user_id', user.id)
      .single();

    const language = profile?.preferred_language || 'English';

    const { fileUrl, fileName } = await req.json();
    
    if (!fileUrl || !fileName) {
      throw new Error('File URL and name are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Download the file
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('chat-files')
      .download(fileUrl);

    if (downloadError) {
      throw new Error('Failed to download file');
    }

    // Convert blob to base64 for image files or text for documents
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '');
    
    let content = '';
    if (isImage) {
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      content = `data:${mimeType};base64,${base64}`;
    } else {
      content = await fileData.text();
    }

    // Generate summary using AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a helpful health assistant. Analyze the provided file and create a concise summary in ${language}. Focus on health-related information if present.`
          },
          {
            role: 'user',
            content: isImage 
              ? [
                  { type: 'text', text: `Please analyze this medical/health document image and provide a summary in ${language}.` },
                  { type: 'image_url', image_url: { url: content } }
                ]
              : `Please summarize this document in ${language}:\n\n${content.slice(0, 10000)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }

    const result = await response.json();
    const summary = result.choices[0].message.content;

    return new Response(
      JSON.stringify({ summary }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Summarize file error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
