const { GoogleGenerativeAI } = require("@google/generative-ai")
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const evaluationService = {
  /**
   * Build evaluation prompt for AI
   */
  buildEvaluationPrompt(project, sanitizedData) {
    const { files, gitStats } = sanitizedData
    const criteria = project.criteria || []

    // Build file content section
    const fileSection = files
      .slice(0, 20)
      .map((f) => `--- ${f.path} ---\n${f.content.substring(0, 1000)}\n`)
      .join("\n")

    const prompt = `You are evaluating a software engineering project submission.

PROJECT: ${project.name}
DESCRIPTION: ${project.description}
EXPECTED TIMELINE: ${project.expected_timeline_days} days
TECH STACK: ${Array.isArray(project.tech_stack) ? project.tech_stack.join(", ") : "Not specified"}

DEVELOPMENT STATISTICS:
- Total Commits: ${gitStats.commitActivity.total}
- Active Days: ${gitStats.commitActivity.activeDays} / ${gitStats.commitActivity.timeline.days} days
- Commits per Day: ${gitStats.commitActivity.commitsPerDay.toFixed(2)}
- Feature Branches: ${gitStats.branches.featureBranches}
- Conventional Commits: ${gitStats.commitQuality.conventionalPercentage.toFixed(0)}%

EVALUATION CRITERIA:
${criteria
  .map(
    (c, i) => `
${i + 1}. ${c.criterion_name} (${c.category} - ${c.weight})
What to check: ${c.what_to_check}

Scoring Rubric:
4 (Strongly Agree): ${c.rubric_4}
3 (Agree): ${c.rubric_3}
2 (Disagree): ${c.rubric_2}
1 (Strongly Disagree): ${c.rubric_1}
`,
  )
  .join("\n")}

CODE FILES (Sanitized, First 20 files):
${fileSection}

INSTRUCTIONS:
1. Evaluate each criterion and assign a score (1-4) based on the rubric
2. Provide specific reasoning for each score, referencing code examples when possible
3. Generate "What Worked Well" - 3-5 bullet points of strengths
4. Generate "Opportunities for Improvement" - 3-5 specific suggestions with:
   - Which criterion/score area
   - Why it needs improvement
   - Where in the code (file references)
   - Specific suggestion for improvement

Return your evaluation in the following JSON format:
{
  "criterionScores": [
    {
      "criterionId": "criterion id from above",
      "criterionName": "criterion name",
      "score": 1-4,
      "reasoning": "detailed reasoning with code references",
      "codeReferences": [
        {
          "file": "path/to/file.js",
          "lines": "10-25",
          "observation": "what you observed"
        }
      ]
    }
  ],
  "whatWorkedWell": [
    "Bullet point 1",
    "Bullet point 2",
    ...
  ],
  "opportunitiesForImprovement": [
    {
      "scoreArea": "Error Handling",
      "score": 3,
      "why": "explanation of the issue",
      "where": "file paths and locations",
      "suggestion": "specific actionable suggestion"
    }
  ],
  "overallScore": calculated average score
}`

    return prompt
  },

  /**
   * Parse AI response into structured format
   */
  parseAIResponse(responseText) {
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Validate structure
      if (!parsed.criterionScores || !Array.isArray(parsed.criterionScores)) {
        throw new Error("Invalid response structure: missing criterionScores")
      }

      return parsed
    } catch (error) {
      console.error("❌Error parsing AI response:", error)
      throw new Error(`Failed to parse AI response: ${error.message}`)
    }
  },

  /**
   * Generate evaluation using Gemini AI
   */
  async generateEvaluation(project, sanitizedData) {
    try {
      console.log(`Generating AI evaluation for project: ${project.name}`)

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = this.buildEvaluationPrompt(project, sanitizedData)

      // Generate evaluation
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log("🤖AI response received, parsing...")

      // Parse response
      const evaluation = this.parseAIResponse(text)

      // Calculate overall score if not provided
      if (!evaluation.overallScore && evaluation.criterionScores.length > 0) {
        evaluation.overallScore = (
          evaluation.criterionScores.reduce((sum, c) => sum + c.score, 0) / evaluation.criterionScores.length
        ).toFixed(2)
      }

      console.log(`Evaluation complete. Overall score: ${evaluation.overallScore}`)

      return {
        evaluation,
        aiModel: "gemini-1.5-flash",
        rawResponse: text,
      }
    } catch (error) {
      console.error("❌Error generating evaluation:", error)
      throw new Error(`AI evaluation failed: ${error.message}`)
    }
  },

  /**
   * Fallback evaluation if AI fails
   */
  generateFallbackEvaluation(project) {
    console.log("⚙️Generating fallback evaluation")

    const criteria = project.criteria || []

    return {
      evaluation: {
        criterionScores: criteria.map((c) => ({
          criterionId: c.id,
          criterionName: c.criterion_name,
          score: 0,
          reasoning: "Automatic evaluation failed. Manual review required.",
          codeReferences: [],
        })),
        whatWorkedWell: ["Automatic evaluation unavailable - requires manual review"],
        opportunitiesForImprovement: [
          {
            scoreArea: "System Error",
            score: 0,
            why: "AI evaluation service encountered an error",
            where: "N/A",
            suggestion: "Staff should perform manual code review",
          },
        ],
        overallScore: 0,
      },
      aiModel: "fallback",
      error: true,
    }
  },
}

module.exports = evaluationService
