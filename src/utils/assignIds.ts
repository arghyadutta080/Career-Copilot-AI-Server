import { randomUUID } from "crypto";

interface InterviewQuestion {
  id: string;
  question: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  topics: string[];
  answer: string | null;
}

export const assignIds = (
  questions: InterviewQuestion[],
): InterviewQuestion[] =>
  questions.map((q) => ({
    ...q,
    id: randomUUID(),
  }));
