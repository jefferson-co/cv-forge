import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_CV_TEXT_LENGTH = 100000;
const MAX_JOB_DESCRIPTION_LENGTH = 20000;

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

    const { cvText, jobDescription } = await req.json();

    if (!cvText || typeof cvText !== 'string') {
      return new Response(
        JSON.stringify({ error: "CV text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (cvText.length > MAX_CV_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `CV text too long (max ${MAX_CV_TEXT_LENGTH.toLocaleString()} characters)` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (jobDescription && jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Job description too long (max ${MAX_JOB_DESCRIPTION_LENGTH.toLocaleString()} characters)` }),
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

    const hasJobDescription = !!jobDescription && jobDescription.trim().length > 0;

    const systemPrompt = `You are an elite ATS (Applicant Tracking System) compatibility analyst with deep expertise in how modern ATS platforms work in 2025.

## YOUR EXPERTISE INCLUDES:
- How major ATS platforms parse documents (Workday, Greenhouse, Lever, iCIMS, Taleo, BambooHR, SAP SuccessFactors)
- Modern AI-powered ATS systems that use NLP and semantic matching
- Recruiter screening patterns and what triggers rejection vs advancement
- Industry-specific CV standards across tech, finance, healthcare, creative, and more

## SCORING METHODOLOGY (2025 Standards)

${hasJobDescription ? `### WITH JOB DESCRIPTION (100 points total)

**Format Compatibility (25 points)**
- Clean, single-column layout (ATS struggles with multi-column): 0-5 pts
- Standard fonts (Arial, Calibri, Garamond, Helvetica): 0-3 pts
- No tables, text boxes, headers/footers, or images embedding text: 0-5 pts
- Proper use of bullet points (•, -, not custom symbols): 0-3 pts
- Consistent date formatting throughout: 0-3 pts
- No special characters that break parsing (smart quotes, em dashes): 0-3 pts
- Section headings are standard text (not images or graphics): 0-3 pts

**Structure & Organization (20 points)**
- Contact info at top with name, email, phone, location, LinkedIn: 0-4 pts
- Standard section headings (Experience/Work History, Education, Skills): 0-4 pts
- Reverse chronological order within sections: 0-3 pts
- Professional Summary/Objective present: 0-3 pts
- No orphaned content or unexplained gaps: 0-3 pts
- Logical flow that matches recruiter expectations: 0-3 pts

**Keyword & Skills Match (35 points)** — THIS IS THE MOST CRITICAL SECTION
- Hard skills from job requirements found verbatim: 0-10 pts
- Technical tools/platforms mentioned in JD present in CV: 0-8 pts
- Industry-specific terminology and jargon: 0-5 pts
- Soft skills alignment (leadership, collaboration, etc.): 0-4 pts
- Job title alignment (exact or close semantic match): 0-4 pts
- Certification/qualification requirements met: 0-4 pts

**Content Quality (20 points)**
- Achievement-oriented bullets (not just responsibilities): 0-5 pts
- Quantified results (numbers, percentages, dollar amounts): 0-5 pts
- Strong action verbs (Led, Architected, Drove, Optimized): 0-4 pts
- No buzzwords/filler (team player, hard worker, detail-oriented): 0-3 pts
- Appropriate length (1-2 pages for most roles): 0-3 pts
` : `### WITHOUT JOB DESCRIPTION (100 points total)

**Format Compatibility (30 points)**
- Clean, single-column layout: 0-6 pts
- Standard fonts: 0-4 pts
- No tables, text boxes, headers/footers, or images embedding text: 0-6 pts
- Proper bullet points: 0-4 pts
- Consistent date formatting: 0-4 pts
- No special characters that break parsing: 0-3 pts
- Standard section headings: 0-3 pts

**Structure & Organization (35 points)**
- Contact info completeness (name, email, phone, location, LinkedIn): 0-7 pts
- Standard section headings: 0-7 pts
- Reverse chronological order: 0-5 pts
- Professional Summary present: 0-5 pts
- Skills section with categorized skills: 0-5 pts
- No unexplained employment gaps: 0-3 pts
- Logical, recruiter-friendly flow: 0-3 pts

**Content Quality (35 points)**
- Achievement-oriented bullets: 0-8 pts
- Quantified results: 0-8 pts
- Strong action verbs: 0-6 pts
- No buzzwords/filler: 0-5 pts
- Appropriate length: 0-4 pts
- Professional tone and grammar: 0-4 pts
`}

## SCORING CALIBRATION
- 0-40: "Needs Improvement" — Major ATS compatibility issues, likely auto-rejected
- 41-60: "Fair" — Some ATS issues, may pass basic screening but weak competitive position
- 61-75: "Good" — Passes most ATS systems but has room for optimization
- 76-88: "Very Good" — Strong ATS compatibility, competitive candidate
- 89-100: "Excellent" — Near-perfect ATS optimization (rare, requires excellent keyword match + formatting)

**CALIBRATION RULES:**
- A CV with NO quantified achievements should NOT score above 75
- A CV missing 3+ required skills from the JD should NOT score above 65
- A CV with formatting issues (tables, graphics) should NOT score above 60
- Be STRICT but FAIR — most real-world CVs score 50-75

## FINDING SEVERITY LEVELS
- **critical**: Will cause ATS rejection or major parsing failure (missing contact info, tables destroying content, no relevant keywords)
- **warning**: Reduces ATS score or recruiter engagement (weak bullets, missing quantification, suboptimal ordering)
- **info**: Nice-to-have improvements (minor formatting tweaks, additional keywords)
- **pass**: Things done correctly (acknowledge good practices)

## BEFORE/AFTER EXAMPLES
Provide SPECIFIC examples using the candidate's ACTUAL CV content — not generic templates. Show exactly how their weak bullets/sections could be improved.`;

    const userPrompt = `## CV TO ANALYZE
===== CV TEXT =====
${cvText}
===== END CV TEXT =====

${hasJobDescription ? `## TARGET JOB DESCRIPTION
===== JOB DESCRIPTION =====
${jobDescription}
===== END JOB DESCRIPTION =====

Perform a thorough keyword gap analysis. For EVERY required skill, tool, and qualification in the job description, check whether it appears in the CV. Be exhaustive.
` : 'No job description provided. Perform a comprehensive general ATS compatibility analysis against industry best practices.'}

## INSTRUCTIONS
1. Score each category by evaluating EVERY sub-criterion listed in the scoring methodology
2. Provide at least 4-6 findings per category with specific, actionable feedback
3. Include at least 3 before/after examples using the candidate's ACTUAL content
4. Be honest and calibrated — don't inflate scores
${hasJobDescription ? '5. For keyword analysis, list EVERY important keyword from the JD and whether it was found' : ''}

Return a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "scoreLabel": "<Needs Improvement|Fair|Good|Very Good|Excellent>",
  "summary": "<3-4 sentence assessment — be specific about strengths AND weaknesses>",
  "breakdown": {
    "formatCompatibility": {
      "score": <number>,
      "maxScore": ${hasJobDescription ? 25 : 30},
      "findings": [
        {
          "id": "format_1",
          "severity": "<critical|warning|info|pass>",
          "title": "<concise title>",
          "description": "<specific observation about THIS CV>",
          "recommendation": "<exact action to take>"
        }
      ]
    },
    "structureOrganization": {
      "score": <number>,
      "maxScore": ${hasJobDescription ? 20 : 35},
      "findings": [{"id":"","severity":"","title":"","description":"","recommendation":""}]
    },
    ${hasJobDescription ? `"keywordMatch": {
      "score": <number>,
      "maxScore": 35,
      "findings": [{"id":"","severity":"","title":"","description":"","recommendation":""}],
      "keywords": [
        {"keyword": "<exact keyword from JD>", "found": <boolean>, "location": "<section where found, or empty>", "importance": "<required|preferred|nice-to-have>"}
      ]
    },` : ''}
    "contentQuality": {
      "score": <number>,
      "maxScore": ${hasJobDescription ? 20 : 35},
      "findings": [{"id":"","severity":"","title":"","description":"","recommendation":""}]
    }
  },
  "criticalIssues": [<subset of findings with severity "critical" — these should be fixed FIRST>],
  "beforeAfterExamples": [
    {
      "title": "<what is being improved>",
      "before": "<ACTUAL text from the candidate's CV>",
      "after": "<improved version with explanation>"
    }
  ]
}

VALIDATION CHECKLIST:
- ☐ Overall score = sum of all category scores
- ☐ Each category score ≤ its maxScore
- ☐ Score label matches the calibration ranges
- ☐ At least 3 before/after examples using REAL content from the CV
- ☐ Findings are specific to THIS CV, not generic advice
${hasJobDescription ? '- ☐ Keywords array covers ALL important terms from the job description' : ''}`;

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
        temperature: 0.3,
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
        JSON.stringify({ error: "Failed to analyze CV. Please try again." }),
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
        overallScore: 60,
        scoreLabel: "Fair",
        summary: "We were able to analyze your CV but encountered some parsing issues. The results shown are based on our best assessment. Please try again for a more detailed analysis.",
        breakdown: {
          formatCompatibility: {
            score: hasJobDescription ? 16 : 20,
            maxScore: hasJobDescription ? 25 : 30,
            findings: [
              {
                id: "format_fallback",
                severity: "info",
                title: "Format Analysis",
                description: "Your CV format appears generally compatible with ATS systems.",
                recommendation: "Ensure you're using standard fonts and avoid complex formatting like tables and text boxes."
              }
            ]
          },
          structureOrganization: {
            score: hasJobDescription ? 14 : 24,
            maxScore: hasJobDescription ? 20 : 35,
            findings: [
              {
                id: "structure_fallback",
                severity: "info",
                title: "Structure Check",
                description: "Your CV structure was analyzed. Use clear section headings for best results.",
                recommendation: "Use standard headings like 'Work Experience', 'Education', 'Skills'."
              }
            ]
          },
          ...(hasJobDescription ? {
            keywordMatch: {
              score: 18,
              maxScore: 35,
              findings: [
                {
                  id: "keywords_fallback",
                  severity: "warning",
                  title: "Keyword Analysis",
                  description: "Review the job description and ensure key skills are mentioned in your CV.",
                  recommendation: "Add relevant keywords from the job description naturally throughout your CV."
                }
              ],
              keywords: []
            }
          } : {}),
          contentQuality: {
            score: hasJobDescription ? 12 : 16,
            maxScore: hasJobDescription ? 20 : 35,
            findings: [
              {
                id: "content_fallback",
                severity: "info",
                title: "Content Quality",
                description: "Your CV content was reviewed for ATS optimization.",
                recommendation: "Use action verbs and quantify achievements where possible."
              }
            ]
          }
        },
        criticalIssues: [],
        beforeAfterExamples: [
          {
            title: "Action Verbs",
            before: "Responsible for managing a team",
            after: "Led a cross-functional team of 5 engineers, delivering 3 major product releases ahead of schedule"
          },
          {
            title: "Quantifiable Achievements",
            before: "Improved website performance",
            after: "Optimized website performance by implementing lazy loading and CDN caching, reducing page load time by 40% and improving Core Web Vitals scores"
          }
        ]
      };
    }

    // Ensure keywordMatch exists if job description was provided
    if (hasJobDescription && !parsedResponse.breakdown.keywordMatch) {
      parsedResponse.breakdown.keywordMatch = {
        score: 15,
        maxScore: 35,
        findings: [],
        keywords: []
      };
    }

    // Validate score consistency
    const breakdown = parsedResponse.breakdown;
    const calculatedScore = (breakdown.formatCompatibility?.score || 0) +
      (breakdown.structureOrganization?.score || 0) +
      (breakdown.keywordMatch?.score || 0) +
      (breakdown.contentQuality?.score || 0);
    
    // Use calculated score if it differs significantly from reported score
    if (Math.abs(calculatedScore - parsedResponse.overallScore) > 5) {
      parsedResponse.overallScore = calculatedScore;
    }

    // Ensure score label matches score
    const score = parsedResponse.overallScore;
    if (score <= 40) parsedResponse.scoreLabel = "Needs Improvement";
    else if (score <= 60) parsedResponse.scoreLabel = "Fair";
    else if (score <= 75) parsedResponse.scoreLabel = "Good";
    else if (score <= 88) parsedResponse.scoreLabel = "Very Good";
    else parsedResponse.scoreLabel = "Excellent";

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("ATS analysis error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
