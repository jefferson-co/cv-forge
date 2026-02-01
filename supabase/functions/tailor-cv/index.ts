import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Maximum input sizes
const MAX_JOB_DESCRIPTION_LENGTH = 20000;
const MAX_CV_CONTENT_LENGTH = 100000;

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

    const { jobDescription, originalCV } = await req.json();

    // Input validation
    if (!jobDescription || typeof jobDescription !== 'string') {
      return new Response(
        JSON.stringify({ error: "Job description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Job description too long (max ${MAX_JOB_DESCRIPTION_LENGTH.toLocaleString()} characters)` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!originalCV || typeof originalCV !== 'object') {
      return new Response(
        JSON.stringify({ error: "Original CV data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate CV content size
    const cvContentString = JSON.stringify(originalCV);
    if (cvContentString.length > MAX_CV_CONTENT_LENGTH) {
      return new Response(
        JSON.stringify({ error: "CV content too large. Please reduce content size." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert CV parser and career coach. Your PRIMARY task is to EXTRACT ALL INFORMATION from the CV text and then tailor it for the job.

CRITICAL: NEVER RETURN EMPTY ARRAYS FOR EDUCATION OR SKILLS IF THEY EXIST IN THE CV TEXT.

EXTRACTION RULES (FOLLOW EXACTLY):
1. EDUCATION EXTRACTION:
   - Search the ENTIRE document for educational information
   - Look for keywords: Education, Academic, Qualification, Degree, University, College, School, Bachelor, Master, PhD, Diploma, Certificate, Training, Course
   - ALSO look in summary/profile sections for mentions like "Graduated from...", "Studied at...", "Bachelor's degree in..."
   - ALSO extract certifications, professional training, bootcamps, online courses
   - If you see ANY institution name + degree/certification, extract it as an education entry
   
2. SKILLS EXTRACTION:
   - Search EVERYWHERE in the document for skills
   - Look in dedicated "Skills" sections
   - ALSO extract skills mentioned in job descriptions: "Developed applications using Python" → Python is a skill
   - ALSO extract skills from project descriptions
   - ALSO extract skills from summary/profile sections
   - Include: technical skills, programming languages, frameworks, tools, soft skills, languages spoken
   - If the document mentions ANY skill, technology, or competency, add it to the skills array

3. WORK EXPERIENCE EXTRACTION:
   - Extract ALL jobs, internships, freelance work, volunteer positions
   - Include job title, company, dates, and responsibilities

TAILORING RULES:
1. DO NOT invent information - only use what's in the CV
2. Emphasize relevant experience for the target job
3. Reorder skills to prioritize job requirements
4. Add keywords from job description naturally
5. Optimize for ATS without keyword stuffing`;

    // The raw CV text is passed in the summary field from the parser
    const rawCVText = originalCV.summary || JSON.stringify(originalCV, null, 2);
    
    const userPrompt = `STEP 1: CAREFULLY READ AND EXTRACT ALL DATA FROM THIS CV TEXT.
STEP 2: Tailor the extracted content for the job description.

JOB DESCRIPTION:
${jobDescription}

===== CV TEXT TO PARSE (READ EVERY LINE) =====
${rawCVText}
===== END OF CV TEXT =====

EXTRACTED CONTACT INFO (use if text above doesn't contain them):
- Name: ${originalCV.fullName || 'Not detected'}
- Email: ${originalCV.email || 'Not detected'}  
- Phone: ${originalCV.phone || 'Not detected'}
- LinkedIn: ${originalCV.linkedinUrl || 'Not detected'}

MANDATORY EXTRACTION CHECKLIST:
☐ Did you find any degrees, certifications, or educational qualifications? → Add to "education" array
☐ Did you find any skills, technologies, or competencies mentioned? → Add to "skills" array
☐ Did you find any work history? → Add to "workExperience" array
☐ Did you find any projects? → Add to "projects" array

IMPORTANT: 
- Read the CV text CHARACTER BY CHARACTER if needed
- Education might be at the beginning, middle, or end
- Skills might be listed as bullet points, comma-separated, or embedded in sentences
- DO NOT return empty education/skills arrays if the CV contains them

Return a JSON object with this exact structure:
{
  "jobAnalysis": {
    "jobTitle": "job title from description",
    "companyName": "company if mentioned",
    "requiredSkills": ["skill1", "skill2"],
    "preferredQualifications": ["qual1"],
    "keyResponsibilities": ["resp1"],
    "industryKeywords": ["keyword1"],
    "experienceLevel": "entry/mid/senior",
    "roleType": "technical/managerial/creative"
  },
  "tailoredCV": {
    "fullName": "from CV",
    "professionalTitle": "tailored title",
    "email": "from CV",
    "phone": "from CV",
    "location": "from CV",
    "linkedinUrl": "from CV",
    "portfolioUrl": "from CV",
    "photoUrl": "",
    "summary": "tailored summary",
    "education": [
      {
        "id": "edu_1",
        "degree": "MUST BE FILLED - degree or certification name",
        "institution": "MUST BE FILLED - school/university name",
        "location": "city/country if available",
        "startDate": "",
        "endDate": "year if available",
        "isCurrentlyStudying": false,
        "gpa": "",
        "coursework": "",
        "description": ""
      }
    ],
    "workExperience": [
      {
        "id": "work_1",
        "jobTitle": "position title",
        "company": "company name",
        "location": "",
        "startDate": "",
        "endDate": "",
        "isCurrentlyWorking": false,
        "responsibilities": "bullet points of achievements"
      }
    ],
    "skills": ["LIST ALL SKILLS FOUND - technical, soft skills, languages, tools"],
    "projects": [],
    "customSections": []
  },
  "changes": [
    {
      "id": "change_1",
      "type": "modify",
      "section": "summary",
      "before": "original",
      "after": "modified",
      "explanation": "reason"
    }
  ],
  "matchScore": 75,
  "keywordsAdded": ["keyword1", "keyword2"]
}

FINAL CHECK BEFORE RESPONDING:
- If education array is empty, RE-READ the CV text for any educational mentions
- If skills array is empty, RE-READ the CV text for any skill mentions
- Only return empty arrays if the CV GENUINELY has no education or skills`;

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
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Failed to process CV. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from AI
    let parsedResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response");
      
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
    console.error("Tailor CV error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
