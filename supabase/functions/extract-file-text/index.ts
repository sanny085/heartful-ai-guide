import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { fileUrl, fileName } = await req.json();
    console.log('Extracting text from file:', fileName);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('chat-files')
      .download(fileUrl);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error('Failed to download file');
    }

    let extractedText = '';
    const fileExtension = fileName.toLowerCase().split('.').pop();

    // Handle different file types
    if (fileExtension === 'pdf') {
      // For PDF files, we'll use a simple text extraction
      // In production, you'd use a proper PDF parsing library
      const arrayBuffer = await fileData.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const textDecoder = new TextDecoder('utf-8');
      const pdfText = textDecoder.decode(uint8Array);
      
      // Basic text extraction from PDF (strips binary data)
      // This is a simple approach - for better results, use a PDF parsing library
      extractedText = pdfText
        .replace(/[^\x20-\x7E\n]/g, ' ') // Remove non-printable characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
        
      if (extractedText.length < 50) {
        // If extraction failed, indicate it's a PDF
        extractedText = `PDF document: ${fileName}\n\nThis is a PDF file. The content could not be extracted as plain text. Please describe what information you need from this document.`;
      }
    } else if (['txt', 'md', 'csv', 'json', 'xml'].includes(fileExtension || '')) {
      // Text-based files
      extractedText = await fileData.text();
    } else if (['doc', 'docx'].includes(fileExtension || '')) {
      // Word documents
      extractedText = `Word document: ${fileName}\n\nThis is a Word document. The content could not be extracted as plain text. Please describe what information you need from this document.`;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
      // Images
      extractedText = `Image file: ${fileName}\n\nThis is an image file. Please describe what you'd like to know about this image.`;
    } else {
      // Unknown file type
      extractedText = `File: ${fileName}\n\nThis file type cannot be read as text. Please describe what information you need.`;
    }

    console.log('Text extracted successfully, length:', extractedText.length);

    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting text:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to extract text from file' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
