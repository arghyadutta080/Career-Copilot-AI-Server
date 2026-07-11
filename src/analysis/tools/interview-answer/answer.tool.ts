import { llm } from "../../../llm/gemini";
import { sendEvent } from "../../../stream/sseManager";
import Analysis from "../../../models/Analysis";
import { buildAnswerPrompt } from "./answer.prompt";

export async function generateAnswerAsyncTask(
  analysisId: string,
  questionId: string,
  category: string,
  questionText: string,
  difficulty: string,
  parsedResume: any,
  jobDescription: string
) {
  // 1. Emit answer_started event
  sendEvent(analysisId, {
    type: "answer_started",
    questionId,
    message: "Generating answer..."
  });

  try {
    const prompt = buildAnswerPrompt(parsedResume, jobDescription, questionText, category, difficulty);

    let fullAnswer = "";
    const stream = await llm.stream(prompt);

    for await (const chunk of stream) {
      const token = chunk.content;
      if (token) {
        const tokenStr = typeof token === "string" ? token : JSON.stringify(token);
        fullAnswer += tokenStr;
        
        sendEvent(analysisId, {
          type: "answer_delta",
          questionId,
          delta: tokenStr
        });
      }
    }

    // 2. Persist full answer to MongoDB
    await Analysis.updateOne(
      { _id: analysisId, [`results.interview.${category}.id`]: questionId },
      {
        $set: {
          [`results.interview.${category}.$.answer.content`]: fullAnswer,
          [`results.interview.${category}.$.answer.status`]: "completed",
          [`results.interview.${category}.$.answer.generatedAt`]: new Date().toISOString()
        }
      }
    );

    // 3. Emit answer_completed event
    sendEvent(analysisId, {
      type: "answer_completed",
      questionId,
      message: "Answer generation completed."
    });

  } catch (error: any) {
    console.error("[generateAnswerAsyncTask] Error:", error);

    // 4. Update status to failed in MongoDB
    await Analysis.updateOne(
      { _id: analysisId, [`results.interview.${category}.id`]: questionId },
      {
        $set: {
          [`results.interview.${category}.$.answer.status`]: "failed"
        }
      }
    );

    // 5. Emit answer_error event
    sendEvent(analysisId, {
      type: "answer_error",
      questionId,
      message: error?.message || "Answer generation failed."
    });
  }
}
