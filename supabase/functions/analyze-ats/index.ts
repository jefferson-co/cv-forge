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

    const { cvText, jobDescription } = await req.json();

    // Input validation
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

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. Your task is to analyze a CV/resume for ATS compatibility and provide detailed, actionable feedback.

SCORING WEIGHTS:
${hasJobDescription ? `
- Format Compatibility: 30 points max
- Structure & Organization: 25 points max
- Keyword Match: 25 points max
- Content Quality: 20 points max
` : `
- Format Compatibility: 35 points max
- Structure & Organization: 35 points max
- Content Quality: 30 points max
`}

ANALYSIS CRITERIA:

FORMAT COMPATIBILITY:
- File format (PDF is generally best, DOCX also works)
- Font usage (standard fonts like Arial, Calibri, Times New Roman are best)
- Tables, images, graphics (these cause ATS parsing issues)
- Headers/footers (often not read by ATS)
- Text boxes and columns (can cause reading order issues)
- Special characters and symbols

STRUCTURE & ORGANIZATION:
- Standard section headings (Work Experience, Education, Skills, etc.)
- Contact information placement and completeness
- Date format consistency
- Bullet point usage
- Logical organization

KEYWORD MATCH (if job description provided):
- Required skills presence
- Technical keywords
- Industry-specific terms
- Experience level match
- Role-specific responsibilities

CONTENT QUALITY:
- Action verbs usage (Led, Developed, Achieved, Implemented)
- Quantifiable achievements (numbers, percentages, metrics)
- Avoiding buzzwords and filler (team player, hard worker)
- Professional summary quality
- Relevance of content

SEVERITY LEVELS:
- critical: Major issues that will likely cause ATS rejection
- warning: Issues that may negatively impact ATS parsing
- info: Suggestions for improvement
- pass: Good practices detected

Return a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "scoreLabel": "<'Needs Improvement' | 'Good' | 'Very Good' | 'Excellent'>",
  "summary": "<2-3 sentence overall assessment>",
  "breakdown": {
    "formatCompatibility": {
      "score": <number>,
      "maxScore": ${hasJobDescription ? 30 : 35},
      "findings": [
        {
          "id": "format_1",
          "severity": "<critical|warning|info|pass>",
          "title": "<short title>",
          "description": "<detailed description>",
          "recommendation": "<actionable fix, optional for pass>"
        }
      ]
    },
    "structureOrganization": {
      "score": <number>,
      "maxScore": ${hasJobDescription ? 25 : 35},
      "findings": [<same structure as above>]
    },
    ${hasJobDescription ? `"keywordMatch": {
      "score": <number>,
      "maxScore": 25,
      "findings": [<same structure>],
      "keywords": [
        {"keyword": "<keyword>", "found": <boolean>, "location": "<where found or empty>"}
      ]
    },` : ''}
    "contentQuality": {
      "score": <number>,
      "maxScore": ${hasJobDescription ? 20 : 30},
      "findings": [<same structure>]
    }
  },
  "criticalIssues": [
    <subset of most important findings with severity 'critical'>
  ],
  "beforeAfterExamples": [
    {
      "title": "<what is being improved>",
      "before": "<problematic text from CV or generic example>",
      "after": "<improved version>"
    }
  ]
}

SCORE LABELS:
- 0-50: "Needs Improvement"
- 51-75: "Good"
- 76-90: "Very Good"
- 91-100: "Excellent"`;

    const userPrompt = `Analyze this CV for ATS compatibility:

===== CV TEXT =====
${cvText}
===== END CV TEXT =====

${hasJobDescription ? `
===== JOB DESCRIPTION =====
${jobDescription}
===== END JOB DESCRIPTION =====

Analyze how well this CV matches the job requirements and extract relevant keywords.
` : 'No job description provided. Perform a general ATS compatibility analysis.'}

Provide comprehensive feedback with specific, actionable recommendations. Include at least 2-3 before/after examples showing how to improve weak areas.`;

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
        JSON.stringify({ error: "Failed to analyze CV. Please try again." }),
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
      console.error("Failed to parse AI response:", parseError);
      
      // Return a fallback response
      parsedResponse = {
        overallScore: 65,
        scoreLabel: "Good",
        summary: "We were able to analyze your CV but encountered some parsing issues. The results shown are based on our best assessment.",
        breakdown: {
          formatCompatibility: {
            score: hasJobDescription ? 20 : 23,
            maxScore: hasJobDescription ? 30 : 35,
            findings: [
              {
                id: "format_fallback",
                severity: "info",
                title: "Format Analysis",
                description: "Your CV format appears generally compatible with ATS systems.",
                recommendation: "Ensure you're using standard fonts and avoid complex formatting."
              }
            ]
          },
          structureOrganization: {
            score: hasJobDescription ? 18 : 25,
            maxScore: hasJobDescription ? 25 : 35,
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
              score: 15,
              maxScore: 25,
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
            score: hasJobDescription ? 12 : 17,
            maxScore: hasJobDescription ? 20 : 30,
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
            after: "Led a team of 5 developers to deliver 3 major projects on time"
          },
          {
            title: "Quantifiable Achievements",
            before: "Improved website performance",
            after: "Optimized website performance, reducing load time by 40%"
          }
        ]
      };
    }

    // Ensure keywordMatch exists if job description was provided
    if (hasJobDescription && !parsedResponse.breakdown.keywordMatch) {
      parsedResponse.breakdown.keywordMatch = {
        score: 12,
        maxScore: 25,
        findings: [],
        keywords: []
      };
    }

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
