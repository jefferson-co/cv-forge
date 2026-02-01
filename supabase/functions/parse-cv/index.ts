import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileType = file.type;
    const fileName = file.name;
    let extractedText = "";

    if (fileType === "application/pdf") {
      // For PDFs, we'll use the AI to extract text since we can't use pdfjs in Deno easily
      // Instead, read the file as base64 and send to AI for extraction
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }

      // Use AI with vision to extract text from PDF
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract ALL text content from this CV/resume document. Return ONLY the raw text, preserving the structure and sections. Include all contact information, work experience, education, skills, projects, and any other content. Do not add any commentary or formatting - just the extracted text."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${base64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI extraction error:", response.status, errorText);
        throw new Error("Failed to extract text from PDF");
      }

      const aiResponse = await response.json();
      extractedText = aiResponse.choices?.[0]?.message?.content || "";

    } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // For DOCX, extract text using basic XML parsing
      const arrayBuffer = await file.arrayBuffer();
      
      // DOCX is a ZIP file containing XML
      // We'll use AI to extract text from it as well
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }

      // For DOCX, we'll try to parse it or use AI
      // Since Deno doesn't have mammoth, we'll use a simpler approach
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract ALL text content from this CV/resume document. Return ONLY the raw text, preserving the structure and sections. Include all contact information, work experience, education, skills, projects, and any other content. Do not add any commentary or formatting - just the extracted text."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI extraction error:", response.status, errorText);
        throw new Error("Failed to extract text from DOCX");
      }

      const aiResponse = await response.json();
      extractedText = aiResponse.choices?.[0]?.message?.content || "";
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported file type. Please upload a PDF or DOCX file." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract basic info from text
    const emailMatch = extractedText.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = extractedText.match(/(?:\+\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
    const linkedinMatch = extractedText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);

    // Try to extract name from first line
    const lines = extractedText.split(/\n+/).filter(l => l.trim());
    const possibleName = lines[0]?.trim() || '';

    return new Response(
      JSON.stringify({
        success: true,
        rawText: extractedText,
        fileName,
        extractedInfo: {
          fullName: possibleName.length < 50 ? possibleName : '',
          email: emailMatch ? emailMatch[0] : '',
          phone: phoneMatch ? phoneMatch[0] : '',
          linkedinUrl: linkedinMatch ? linkedinMatch[0] : '',
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Parse CV error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to parse CV" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
