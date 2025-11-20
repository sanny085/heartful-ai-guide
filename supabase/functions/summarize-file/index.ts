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

    const { fileUrl, fileName, additionalContext } = await req.json();
    
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
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in chunks to avoid stack overflow
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64 = btoa(binary);
      
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
            content: `You are an experienced medical doctor analyzing health reports. Provide a comprehensive analysis in ${language} with the following structure:

📋 **REPORT SUMMARY**
Brief overview of the report type and key findings

🔍 **MAIN FINDINGS**
- List the most important results
- Highlight any abnormal values or concerns

✅ **DO'S (Recommendations)**
- Specific actions to take
- Lifestyle modifications
- Follow-up tests if needed

❌ **DON'TS (Things to Avoid)**
- Activities or habits to avoid
- Foods or substances to limit

🛡️ **PREVENTIVE MEASURES**
- Long-term health strategies
- Monitoring suggestions
- Risk reduction tips

⚠️ **IMPORTANT NOTE**
Always consult with your healthcare provider for personalized medical advice.

Be empathetic, clear, and actionable in your analysis.`
          },
          {
            role: 'user',
            content: isImage 
              ? [
                  { 
                    type: 'text', 
                    text: `Please analyze this medical report and provide detailed insights with do's, don'ts, and preventive measures in ${language}.${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}` 
                  },
                  { type: 'image_url', image_url: { url: content } }
                ]
              : `Please analyze this medical document and provide detailed insights with do's, don'ts, and preventive measures in ${language}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}:\n\n${content.slice(0, 10000)}`
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
