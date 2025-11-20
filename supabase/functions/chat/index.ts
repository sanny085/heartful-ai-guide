import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema for incoming messages
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().trim().min(1).max(50000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
  conversationId: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: ' + validationResult.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { messages, conversationId } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get auth header to verify user
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

    // Get user's profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, preferred_language, medical_category')
      .eq('user_id', user.id)
      .single();

    const language = profile?.preferred_language || 'English';
    const userName = profile?.name || 'there';
    const medicalFocus = profile?.medical_category || 'general health';

    // Get user's latest health assessment if available
    const { data: latestAssessment } = await supabase
      .from('heart_health_assessments')
      .select('age, gender, bmi, risk_score, heart_age')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let healthContext = '';
    if (latestAssessment) {
      healthContext = `\n\nUser's Health Profile:
- Age: ${latestAssessment.age}
- Gender: ${latestAssessment.gender}
- BMI: ${latestAssessment.bmi}
- Heart Risk Score: ${latestAssessment.risk_score}/100
- Heart Age: ${latestAssessment.heart_age}

Use this information to provide personalized health advice when relevant.`;
    }

    const systemPrompt = `You are a compassionate AI Health Coach specializing in ${medicalFocus}. Your name is HealthAI.

Key Guidelines:
- Respond in ${language}
- Address the user as ${userName}
- Provide evidence-based health information
- Be empathetic and supportive
- Encourage healthy lifestyle choices
- When discussing medical topics, remind users to consult healthcare professionals for diagnosis
- Focus on preventive care and wellness
- Use simple, clear language
- Ask clarifying questions when needed${healthContext}

When analyzing uploaded documents (reports, test results, medical records):
- Provide a clear, structured summary of the document
- Explain key findings and what they mean in simple terms
- Highlight any concerning values or patterns
- Suggest preventive measures and lifestyle changes based on the content
- Break down medical terminology into easy-to-understand language
- Organize your response with clear sections: Summary, Key Findings, Recommendations, Prevention Tips

Remember: You're a supportive coach, not a replacement for professional medical advice. Always recommend consulting with healthcare professionals for proper diagnosis and treatment.`;

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
            content: systemPrompt
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
