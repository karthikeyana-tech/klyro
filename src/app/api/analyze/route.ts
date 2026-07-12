import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60 seconds for AI response

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string | null;
    const jobTitle = formData.get("jobTitle") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Extract text from PDF
    let resumeText = "";
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } catch (pdfError) {
      console.error("PDF parse error:", pdfError);
      return NextResponse.json(
        { error: "Failed to read PDF. Make sure it's a valid text-based PDF (not scanned image)." },
        { status: 400 }
      );
    }

    if (!resumeText || resumeText.trim().length < 30) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. Ensure it's not an image-only PDF." },
        { status: 400 }
      );
    }

    // Truncate if too long (save tokens)
    if (resumeText.length > 6000) {
      resumeText = resumeText.substring(0, 6000);
    }

    // Build prompt
    const systemPrompt = "You are an expert resume analyzer and professional writing coach. Respond ONLY with valid JSON. No explanation, no markdown, no code fences.";
    
    let userPrompt = "";
    if (jobDescription) {
      userPrompt = `Analyze this resume against the job description below.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

`;
    } else {
      userPrompt = `Analyze this resume for overall ATS compatibility and quality.

RESUME:
${resumeText}

`;
    }

    userPrompt += `Return a JSON object with exactly these fields:
{
  "atsScore": (number 0-100),
  "overallRating": (one of: "excellent", "good", "average", "needs_improvement"),
  "skills": {
    "found": (array of strings - skills found in resume),
    "missing": (array of strings - important skills missing),
    "matchPercentage": (number 0-100)
  },
  "sections": {
    "contact": {"score": (1-10), "feedback": "..."},
    "summary": {"score": (1-10), "feedback": "..."},
    "experience": {"score": (1-10), "feedback": "..."},
    "education": {"score": (1-10), "feedback": "..."},
    "skills": {"score": (1-10), "feedback": "..."},
    "formatting": {"score": (1-10), "feedback": "..."}
  },
  "keywords": {
    "matched": (array of strings),
    "missing": (array of strings),
    "density": (number 0-100)
  },
  "suggestions": [
    {"category": "content|formatting|keywords|structure", "priority": "high|medium|low", "suggestion": "...", "example": "..."}
  ],
  "strengths": (array of strings),
  "weaknesses": (array of strings),
  "languageIssues": {
    "jargon": [
      {"word": "(the buzzword/jargon found)", "context": "(the sentence where it appears)", "fix": "(simpler/clearer alternative)"}
    ],
    "weakVerbs": [
      {"word": "(weak verb found)", "context": "(the sentence)", "fix": "(stronger action verb to replace it)"}
    ],
    "missingMetrics": [
      {"sentence": "(the sentence that lacks numbers)", "fix": "(rewritten version with placeholder metrics)"}
    ],
    "grammar": [
      {"issue": "(brief description of the error)", "context": "(the sentence with the error)", "fix": "(corrected version)"}
    ]
  }
}

IMPORTANT for languageIssues:
- "jargon": Find overused corporate buzzwords like "synergy", "leverage", "paradigm", "utilize", "spearheaded", "ecosystem", "value-add" etc. Only flag genuinely empty/vague words.
- "weakVerbs": Find weak/passive verbs like "handled", "helped", "did", "was responsible for", "worked on". Suggest strong action verbs like "managed", "designed", "increased", "built", "delivered".
- "missingMetrics": Find achievement statements that would be stronger with numbers. E.g. "Improved sales" → "Improved sales by 30% over 6 months".
- "grammar": Find actual spelling/grammar errors, tense inconsistencies, or awkward phrasing.
- Return empty arrays [] if no issues found in a category. Be specific — quote the exact text from the resume.`;

    // Call OpenRouter API directly using fetch (more reliable than openai package)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: Missing API key" },
        { status: 500 }
      );
    }

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "AI Resume Analyzer",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 5000,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error("OpenRouter API error:", aiResponse.status, errorData);
      return NextResponse.json(
        { error: `AI service error (${aiResponse.status}). Please try again.` },
        { status: 502 }
      );
    }

    const aiData = await aiResponse.json();
    const responseText = aiData?.choices?.[0]?.message?.content;

    if (!responseText) {
      return NextResponse.json(
        { error: "AI returned empty response. Please try again." },
        { status: 500 }
      );
    }

    // Parse AI response - handle markdown code blocks
    let cleanResponse = responseText.trim();
    
    // Remove ```json or ``` wrapper if present
    if (cleanResponse.startsWith("```")) {
      const lines = cleanResponse.split("\n");
      lines.shift(); // remove first ``` line
      cleanResponse = lines.join("\n");
      cleanResponse = cleanResponse.replace(/```\s*$/, "").trim();
    }

    let analysis;
    try {
      analysis = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error("JSON parse failed. Raw response:", cleanResponse.substring(0, 500));
      return NextResponse.json(
        { error: "AI response was not valid JSON. Please try again." },
        { status: 500 }
      );
    }

    // Ensure all required fields have defaults
    const safeAnalysis = {
      atsScore: analysis.atsScore ?? 50,
      overallRating: analysis.overallRating ?? "average",
      skills: {
        found: analysis.skills?.found ?? [],
        missing: analysis.skills?.missing ?? [],
        matchPercentage: analysis.skills?.matchPercentage ?? analysis.skills?.match_percentage ?? 50,
      },
      sections: analysis.sections ?? {
        contact: { score: 5, feedback: "N/A" },
        summary: { score: 5, feedback: "N/A" },
        experience: { score: 5, feedback: "N/A" },
        education: { score: 5, feedback: "N/A" },
        skills: { score: 5, feedback: "N/A" },
        formatting: { score: 5, feedback: "N/A" },
      },
      keywords: {
        matched: analysis.keywords?.matched ?? [],
        missing: analysis.keywords?.missing ?? [],
        density: analysis.keywords?.density ?? 50,
      },
      suggestions: analysis.suggestions ?? [],
      strengths: analysis.strengths ?? [],
      weaknesses: analysis.weaknesses ?? [],
      languageIssues: {
        jargon: analysis.languageIssues?.jargon ?? [],
        weakVerbs: analysis.languageIssues?.weakVerbs ?? [],
        missingMetrics: analysis.languageIssues?.missingMetrics ?? [],
        grammar: analysis.languageIssues?.grammar ?? [],
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        id: crypto.randomUUID(),
        ...safeAnalysis,
        jobTitle: jobTitle || "General Analysis",
        fileName: file.name,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
