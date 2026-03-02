import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_JOB_DESCRIPTION_LENGTH = 20000;
const MAX_CV_CONTENT_LENGTH = 100000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const systemPrompt = `You are a world-class career strategist and ATS optimization expert with deep knowledge of modern recruiting technology (2025 standards).

Your mission: Transform the candidate's CV to PERFECTLY match the target job description while maintaining 100% truthfulness.

## CORE PRINCIPLES

1. **NEVER fabricate experience, skills, or qualifications** — only reframe, reorder, and emphasize what genuinely exists in the CV.
2. **Mirror the job description language precisely** — ATS systems perform exact and semantic keyword matching. Use the EXACT terminology from the job posting (e.g., if they say "cross-functional collaboration", use that phrase, not "working with different teams").
3. **Front-load relevance** — The most job-relevant content should appear first in every section.
4. **Quantify everything possible** — Transform vague descriptions into measurable achievements. If the CV says "improved performance", keep it but note it should be quantified.
5. **Optimize for both ATS and human readers** — Keywords for machines, compelling narratives for recruiters.

## TAILORING STRATEGY

### Professional Title
- Match the exact job title from the posting when the candidate's experience supports it
- Example: If applying for "Senior Product Designer" and they are a "Product Designer", use "Senior Product Designer" ONLY if their experience level justifies it

### Summary/Profile
- Lead with years of experience + core domain that matches the role
- Include 3-5 of the most critical keywords from the job description naturally
- Mention the specific industry/domain if relevant
- End with a value proposition aligned to the role's key responsibility

### Work Experience
- Rewrite bullet points to emphasize responsibilities that mirror the job requirements
- Use the STAR method: Situation → Task → Action → Result
- Lead each bullet with a strong action verb (Led, Architected, Spearheaded, Drove, Orchestrated)
- Include metrics wherever the original CV has them; flag where metrics could be added
- Reorder bullets so the most job-relevant achievements come first

### Skills
- Reorder to place the job's required skills FIRST
- Group into categories matching the job's requirements (e.g., "Programming Languages", "Frameworks", "Cloud & DevOps")
- Include exact skill names from the job description (e.g., "React.js" not just "React" if the JD says "React.js")
- Add skill variations the ATS might search for (e.g., both "JavaScript" and "JS")

### Education
- Highlight relevant coursework, projects, or thesis topics that align with the job
- If certifications match job requirements, ensure they're prominently placed

## MATCH SCORE CALCULATION
Calculate an honest match score (0-100) based on:
- Required skills coverage: How many required skills does the candidate have? (40% weight)
- Experience level alignment: Does their seniority match? (20% weight)
- Industry/domain relevance: Is their background in the same field? (20% weight)
- Keyword density: How many job description keywords appear naturally in the tailored CV? (20% weight)

Be HONEST with the score. A 95%+ should only be given if the candidate is a near-perfect match. Most tailored CVs should score 65-85%.

## CHANGES TRACKING
For EVERY modification you make, document it with:
- What was changed (before/after)
- WHY it was changed (which job requirement it addresses)
- The type of change (added keyword, reworded bullet, reordered section, etc.)`;

    const rawCVText = originalCV.summary || JSON.stringify(originalCV, null, 2);
    
    const userPrompt = `## JOB DESCRIPTION TO TARGET
${jobDescription}

## CANDIDATE'S CURRENT CV DATA
===== FULL CV TEXT =====
${rawCVText}
===== END CV TEXT =====

## PRE-EXTRACTED CONTACT INFO (use as fallback)
- Name: ${originalCV.fullName || 'Not detected'}
- Email: ${originalCV.email || 'Not detected'}  
- Phone: ${originalCV.phone || 'Not detected'}
- Location: ${originalCV.location || 'Not detected'}
- LinkedIn: ${originalCV.linkedinUrl || 'Not detected'}
- Portfolio: ${originalCV.portfolioUrl || 'Not detected'}

## YOUR TASK

1. **ANALYZE** the job description thoroughly — identify required skills, preferred qualifications, key responsibilities, seniority level, industry, and cultural keywords.

2. **EXTRACT** every piece of information from the CV — education (degrees, certs, courses), ALL skills (technical + soft), ALL work experience, projects, and custom sections. Read the ENTIRE document. Check summary sections for embedded skills/education mentions.

3. **TAILOR** the CV content to maximize alignment with the job description using the strategies above.

4. **SCORE** the match honestly based on the weighted criteria.

5. **DOCUMENT** every change with clear rationale.

Return a JSON object with this EXACT structure:
{
  "jobAnalysis": {
    "jobTitle": "exact title from job posting",
    "companyName": "company name if mentioned",
    "requiredSkills": ["skill1", "skill2"],
    "preferredQualifications": ["qual1"],
    "keyResponsibilities": ["resp1"],
    "industryKeywords": ["keyword1"],
    "experienceLevel": "entry/mid/senior/lead",
    "roleType": "technical/managerial/creative/hybrid"
  },
  "tailoredCV": {
    "fullName": "from CV",
    "professionalTitle": "optimized title matching the job",
    "email": "from CV",
    "phone": "from CV",
    "location": "from CV",
    "linkedinUrl": "from CV or empty string",
    "portfolioUrl": "from CV or empty string",
    "photoUrl": "",
    "summary": "2-4 sentence tailored professional summary packed with relevant keywords",
    "education": [
      {
        "id": "edu_1",
        "degree": "degree name",
        "institution": "school name",
        "location": "location",
        "startDate": "start date",
        "endDate": "end date or year",
        "isCurrentlyStudying": false,
        "gpa": "if available",
        "coursework": "relevant coursework for the job",
        "description": "relevant honors/activities"
      }
    ],
    "workExperience": [
      {
        "id": "work_1",
        "jobTitle": "position title",
        "company": "company name",
        "location": "location",
        "startDate": "start date",
        "endDate": "end date",
        "isCurrentlyWorking": false,
        "responsibilities": "• Achievement-focused bullet points using STAR method\\n• Each bullet starts with action verb\\n• Include metrics where available"
      }
    ],
    "skills": ["ordered by relevance to job - required skills first"],
    "projects": [
      {
        "id": "proj_1",
        "title": "project name",
        "role": "role if applicable",
        "date": "date",
        "description": "tailored description emphasizing job-relevant aspects",
        "link": "link if available"
      }
    ],
    "customSections": []
  },
  "changes": [
    {
      "id": "change_1",
      "type": "modify|add|reorder|remove",
      "section": "summary|skills|workExperience|education|title",
      "before": "original text",
      "after": "modified text",
      "explanation": "Changed because the job requires X, and this highlights the candidate's relevant experience in Y"
    }
  ],
  "matchScore": 75,
  "keywordsAdded": ["keyword1", "keyword2"]
}

## CRITICAL VALIDATION BEFORE RESPONDING
- ☐ Education array is NOT empty if CV mentions any degrees/certs/courses
- ☐ Skills array is NOT empty if CV mentions any skills/technologies
- ☐ Work experience preserves ALL positions from original CV
- ☐ No fabricated information — everything traces back to the original CV
- ☐ Job description keywords are naturally integrated, not stuffed
- ☐ Match score honestly reflects the candidate's fit (not inflated)
- ☐ Every change has a clear rationale tied to a job requirement`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
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

    let parsedResponse;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      
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
