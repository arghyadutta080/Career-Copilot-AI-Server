import { ATSResult } from "../tools/ats/ats.schema";

export interface AnalysisState {
  analysisId: string;
  resumeId: string;
  jobDescriptionId: string;
  rawResume: string;
  parsedResume: any;
  jobDescription: string;
  ats?: ATSResult;
  missingSkills?: string[];
  interviewQuestions?: string[];
  roadmap?: string[];
  optimizedResume?: string;
  coverLetter?: string;
}
