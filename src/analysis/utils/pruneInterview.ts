import { InterviewResult } from "../tools/interview/interview.schema";

export interface PrunedQuestion {
  id?: string;
  question: string;
  difficulty?: string;
  topics?: string[];
}

export interface PrunedFollowUp {
  parentQuestion: string;
  followUps?: PrunedQuestion[];
}

export interface PrunedInterviewResult {
  hr?: PrunedQuestion[];
  resumeBased?: PrunedQuestion[];
  experienceBased?: PrunedQuestion[];
  projectBased?: PrunedQuestion[];
  technical?: PrunedQuestion[];
  coding?: PrunedQuestion[];
  behavioral?: PrunedQuestion[];
  followUps?: PrunedFollowUp[];
}

export function pruneInterview(interview: InterviewResult): PrunedInterviewResult | null {
  if (!interview) return null;
  const categories = ["hr", "resumeBased", "experienceBased", "projectBased", "technical", "coding", "behavioral"];
  const pruned: PrunedInterviewResult = {};
  for (const cat of categories) {
    const list = (interview as any)[cat];
    if (Array.isArray(list)) {
      (pruned as any)[cat] = list.map((q) => ({
        id: q.id,
        question: q.question,
        difficulty: q.difficulty,
        topics: q.topics,
      }));
    }
  }
  if (Array.isArray(interview.followUps)) {
    pruned.followUps = interview.followUps.map((group) => ({
      parentQuestion: group.parentQuestion,
      followUps: group.followUps?.map((q) => ({
        id: q.id,
        question: q.question,
        difficulty: q.difficulty,
        topics: q.topics,
      })),
    }));
  }
  return pruned;
}