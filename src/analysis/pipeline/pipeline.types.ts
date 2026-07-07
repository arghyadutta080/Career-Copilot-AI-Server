import { ATSResult } from "../tools/ats/ats.schema";
import { CoverLetterResult } from "../tools/cover-letter/coverLetter.schema";
import { InterviewResult } from "../tools/interview/interview.schema";
import { ResumeOptimizerResult } from "../tools/resume-optimizer/optimizer.schema";
import { SkillGapResult } from "../tools/skill-gap/skillGap.schema";

export interface AnalysisState {
  analysisId: string;
  resumeId: string;
  jobDescriptionId: string;
  rawResume: string;
  parsedResume: any;
  jobTitle: string;
  company: string;
  jobDescription: string;
  ats?: ATSResult;
  skillGap?: SkillGapResult;
  interview?: InterviewResult;
  roadmap?: string[];
  resumeOptimizer?: ResumeOptimizerResult;
  coverLetter?: CoverLetterResult;
}
