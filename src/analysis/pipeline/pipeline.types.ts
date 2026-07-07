import { ATSResult } from "../tools/ats/ats.schema";
import { ResumeOptimizerResult } from "../tools/resume-optimizer/optimizer.schema";
import { SkillGapResult } from "../tools/skill-gap/skillGap.schema";

export interface AnalysisState {
  analysisId: string;
  resumeId: string;
  jobDescriptionId: string;
  rawResume: string;
  parsedResume: any;
  jobDescription: string;
  ats?: ATSResult;
  skillGap?: SkillGapResult;
  interviewQuestions?: string[];
  roadmap?: string[];
  resumeOptimizer?: ResumeOptimizerResult;
  coverLetter?: string;
}
