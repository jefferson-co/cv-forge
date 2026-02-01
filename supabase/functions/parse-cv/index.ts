import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 10MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileType = file.type;
    const fileName = file.name;

    // Validate file type
    if (!ALLOWED_TYPES.includes(fileType)) {
      return new Response(
        JSON.stringify({ error: "Unsupported file type. Please upload a PDF or DOCX file." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let extractedText = "";

    if (fileType === "application/pdf") {
      // For PDFs, we'll use the AI to extract text
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in chunks to avoid stack overflow
      let base64 = "";
      const chunkSize = 32768; // 32KB chunks
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        base64 += String.fromCharCode.apply(null, Array.from(chunk));
      }
      base64 = btoa(base64);
      
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        console.error("LOVABLE_API_KEY is not configured");
        return new Response(
          JSON.stringify({ error: "Service configuration error. Please try again later." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
        console.error("AI extraction error:", response.status);
        return new Response(
          JSON.stringify({ error: "Failed to process document. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiResponse = await response.json();
      extractedText = aiResponse.choices?.[0]?.message?.content || "";

    } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // DOCX is a ZIP file containing XML - we need to extract text from document.xml
      const arrayBuffer = await file.arrayBuffer();
      
      // Use fflate to unzip the DOCX
      const { unzipSync } = await import("https://esm.sh/fflate@0.8.2");
      
      try {
        const uint8Array = new Uint8Array(arrayBuffer);
        const unzipped = unzipSync(uint8Array);
        
        // Find and read word/document.xml
        const documentXml = unzipped["word/document.xml"];
        if (!documentXml) {
          return new Response(
            JSON.stringify({ error: "Invalid document format. Please upload a valid DOCX file." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Decode the XML content
        const decoder = new TextDecoder();
        const xmlContent = decoder.decode(documentXml);
        
        // Extract text from XML by removing tags and cleaning up
        // Simple approach: extract all text nodes and add newlines for paragraphs
        const allContent = xmlContent
          .replace(/<w:p[^>]*\/>/g, "\n") // Self-closing paragraphs
          .replace(/<w:p[^>]*>/g, "\n") // Paragraph starts
          .replace(/<w:br[^>]*>/g, "\n") // Line breaks
          .replace(/<w:tab[^>]*>/g, "\t") // Tabs
          .replace(/<w:t[^>]*>([^<]*)<\/w:t>/g, "$1") // Extract text
          .replace(/<[^>]+>/g, "") // Remove remaining XML tags
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/\n\s*\n\s*\n/g, "\n\n") // Clean up extra newlines
          .trim();
        
        extractedText = allContent;
        
      } catch (unzipError) {
        console.error("DOCX parsing error:", unzipError);
        return new Response(
          JSON.stringify({ error: "Failed to parse document. The file may be corrupted." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
    console.error("Parse CV error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ error: "An error occurred processing your document. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
