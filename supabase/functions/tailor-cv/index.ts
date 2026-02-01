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
    const { jobDescription, originalCV } = await req.json();

    if (!jobDescription) {
      return new Response(
        JSON.stringify({ error: "Job description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert CV writer and career coach. Your task is to analyze a job description and tailor a CV to match the job requirements.

CRITICAL RULES:
1. DO NOT invent false information or experience
2. Emphasize relevant skills and experiences from the original CV
3. Rewrite bullets to highlight achievements matching job requirements
4. Add keywords naturally from the job description
5. Reorder skills to prioritize job requirements
6. Optimize for ATS (Applicant Tracking Systems) without keyword stuffing
7. Keep the same structure and sections

For each modification, track the change with:
- type: "add", "remove", or "modify"
- section: which part of the CV was changed
- before: original text (empty for additions)
- after: new text (empty for removals)
- explanation: brief reason for the change

Return a JSON response with:
1. jobAnalysis: Extract job requirements
2. tailoredCV: The modified CV content
3. changes: Array of changes made
4. matchScore: 0-100 score of how well the CV matches
5. keywordsAdded: Array of keywords added from job description`;

    // The raw CV text is passed in the summary field from the parser
    const rawCVText = originalCV.summary || JSON.stringify(originalCV, null, 2);
    
    const userPrompt = `Analyze this job description and tailor the CV accordingly.

JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV (RAW TEXT EXTRACTED FROM PDF/DOCX):
${rawCVText}

ADDITIONAL EXTRACTED INFO:
- Name: ${originalCV.fullName || 'Not detected'}
- Email: ${originalCV.email || 'Not detected'}
- Phone: ${originalCV.phone || 'Not detected'}
- LinkedIn: ${originalCV.linkedinUrl || 'Not detected'}

Parse the raw CV text above and return your response as a valid JSON object with this structure:
{
  "jobAnalysis": {
    "jobTitle": "extracted job title",
    "companyName": "company name if found",
    "requiredSkills": ["skill1", "skill2"],
    "preferredQualifications": ["qual1", "qual2"],
    "keyResponsibilities": ["resp1", "resp2"],
    "industryKeywords": ["keyword1", "keyword2"],
    "experienceLevel": "entry/mid/senior",
    "roleType": "technical/managerial/creative/etc"
  },
  "tailoredCV": {
    "fullName": "extracted from CV",
    "professionalTitle": "tailored to job",
    "email": "from CV",
    "phone": "from CV",
    "location": "from CV",
    "linkedinUrl": "from CV",
    "portfolioUrl": "from CV if present",
    "photoUrl": "",
    "summary": "tailored professional summary emphasizing relevant experience for this role",
    "education": [
      {
        "degree": "degree name",
        "institution": "school name",
        "year": "graduation year",
        "description": "relevant details"
      }
    ],
    "workExperience": [
      {
        "jobTitle": "position title",
        "company": "company name",
        "duration": "date range",
        "description": "tailored bullet points highlighting relevant achievements"
      }
    ],
    "skills": ["skill1", "skill2", "...prioritized by relevance to job"],
    "projects": [
      {
        "name": "project name",
        "description": "tailored description"
      }
    ],
    "customSections": []
  },
  "changes": [
    {
      "id": "change_1",
      "type": "modify",
      "section": "summary",
      "before": "original text from CV",
      "after": "modified text",
      "explanation": "Why this change improves the match"
    }
  ],
  "matchScore": 85,
  "keywordsAdded": ["keyword1", "keyword2"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service temporarily unavailable");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from AI
    let parsedResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      
      // Return a fallback response with the original CV
      parsedResponse = {
        jobAnalysis: {
          jobTitle: "Unknown Role",
          companyName: "",
          requiredSkills: [],
          preferredQualifications: [],
          keyResponsibilities: [],
          industryKeywords: [],
          experienceLevel: "mid",
          roleType: "general"
        },
        tailoredCV: originalCV,
        changes: [],
        matchScore: 70,
        keywordsAdded: []
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Tailor CV error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
