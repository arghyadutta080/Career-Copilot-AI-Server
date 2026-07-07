import Analysis from "../../models/Analysis";
import Resume from "../../models/Resume";
import JobDescription from "../../models/JobDescription";
import { AnalysisState } from "../pipeline/pipeline.types";

const mapQuestion = (q: any) => ({
  id: q.id || "",
  question: q.question || "",
  difficulty: q.difficulty as "Easy" | "Medium" | "Hard" | undefined,
  topics: q.topics || [],
  answer: q.answer || null,
});

export async function buildAnalysisState(
  analysisId: string,
): Promise<AnalysisState> {
  const analysis = await Analysis.findById(analysisId);
  if (!analysis) throw new Error("Analysis not found");

  if (analysis?.toolStatus?.coverLetter !== "completed") {
    throw new Error(
      "Complete ATS analysis before generating interview questions.",
    );
  }
  const resume = await Resume.findById(analysis.resumeId);
  const job = await JobDescription.findById(analysis.jobDescriptionId);

  if (!resume || !job) {
    throw new Error("Required data not found");
  }

  const state: AnalysisState = {
    analysisId: analysis.id,
    resumeId: resume.id,
    jobDescriptionId: job.id,
    rawResume: resume.rawText || "",
    parsedResume: resume.parsedData,
    jobDescription: job.description,
    jobTitle: job.title,
    company: job.company,
    ats: analysis.results?.ats
      ? {
          score: analysis.results.ats.score ?? 0,
          strengths: analysis.results.ats.strengths || [],
          weaknesses: analysis.results.ats.weaknesses || [],
          missingKeywords: analysis.results.ats.missingKeywords || [],
          summary: analysis.results.ats.summary || "",
        }
      : undefined,
    skillGap: analysis.results?.skillGap
      ? {
          missingSkills: analysis.results.skillGap.missingSkills || [],
          recommendedSkills: analysis.results.skillGap.recommendedSkills || [],
          learningPriority: (
            analysis.results.skillGap.learningPriority || []
          ).map((lp) => ({
            skill: lp.skill || "",
            reason: lp.reason || "",
          })),
          summary: analysis.results.skillGap.summary || "",
        }
      : undefined,
    resumeOptimizer: analysis.results?.optimizer
      ? {
          overallSummary: analysis.results.optimizer.overallSummary || "",
          atsImpact: {
            currentScore:
              analysis.results.optimizer.atsImpact?.currentScore ?? 0,
            expectedScore:
              analysis.results.optimizer.atsImpact?.expectedScore ?? 0,
            reason: analysis.results.optimizer.atsImpact?.reason || "",
          },
          keywordSuggestions:
            analysis.results.optimizer.keywordSuggestions || [],
          experienceSuggestions: (
            analysis.results.optimizer.experienceSuggestions || []
          ).map((es) => ({
            company: es.company || "",
            role: es.role || undefined,
            suggestions: es.suggestions || [],
          })),
          projectSuggestions: (
            analysis.results.optimizer.projectSuggestions || []
          ).map((ps) => ({
            project: ps.project || "",
            suggestions: ps.suggestions || [],
          })),
          sectionSuggestions: (
            analysis.results.optimizer.sectionSuggestions || []
          ).map((ss) => ({
            section: (ss.section || "Summary") as
              | "Summary"
              | "Skills"
              | "Experience"
              | "Projects"
              | "Education"
              | "Certifications",
            suggestion: ss.suggestion || "",
          })),
          optimizedContent: analysis.results.optimizer.optimizedContent || "",
        }
      : undefined,

    coverLetter: analysis.results?.coverLetter
      ? {
          subject: analysis.results.coverLetter.subject || "",
          content: analysis.results.coverLetter.content || "",
        }
      : undefined,

    interview: analysis.results?.interview
      ? {
          hr: (analysis.results.interview.hr || []).map(mapQuestion),
          resumeBased: (analysis.results.interview.resumeBased || []).map(
            mapQuestion,
          ),
          experienceBased: (
            analysis.results.interview.experienceBased || []
          ).map(mapQuestion),
          projectBased: (analysis.results.interview.projectBased || []).map(
            mapQuestion,
          ),
          technical: (analysis.results.interview.technical || []).map(
            mapQuestion,
          ),
          coding: (analysis.results.interview.coding || []).map(mapQuestion),
          behavioral: (analysis.results.interview.behavioral || []).map(
            mapQuestion,
          ),
          followUps: (analysis.results.interview.followUps || []).map((fu) => ({
            parentQuestion: fu.parentQuestion || "",
            followUps: (fu.followUps || []).map(mapQuestion),
          })),
        }
      : undefined,

    toolStatus: analysis?.toolStatus,
  };

  return state;
}
