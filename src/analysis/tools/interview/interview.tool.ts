import { assignIds } from "../../../utils/assignIds";
import Analysis from "../../../models/Analysis";
import { llm } from "../../../llm/gemini";
import { sendEvent } from "../../../stream/sseManager";

import { AnalysisState } from "../../pipeline/pipeline.types";

import { InterviewResultSchema, InterviewResult } from "./interview.schema";
import { buildInterviewPrompt } from "./interview.prompt";

export class InterviewTool {
  async execute(state: AnalysisState): Promise<AnalysisState> {
    await Analysis.findByIdAndUpdate(state.analysisId, {
      $set: {
        "toolStatus.interview": "running",
      },
    });

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Interview Questions",
      progress: 30,
      message: "Generating interview questions...",
    });

    const structuredLLM = llm.withStructuredOutput(InterviewResultSchema).withConfig({
      runName: "Interview Questions Generation Tool",
    });

    const result = (await structuredLLM.invoke(
      buildInterviewPrompt(
        state.parsedResume,
        state.jobTitle!,
        state.company!,
        state.jobDescription,
        state.ats!,
        state.skillGap!,
      ),
    )) as InterviewResult;

    const prepareQuestions = (questions: any[]) => {
      return assignIds(questions || []).map((q: any) => ({
        ...q,
        answer: q.answer || { content: null, status: "not_started", generatedAt: null }
      }));
    };

    result.hr = prepareQuestions(result.hr);
    result.resumeBased = prepareQuestions(result.resumeBased);
    result.experienceBased = prepareQuestions(result.experienceBased);
    result.projectBased = prepareQuestions(result.projectBased);
    result.technical = prepareQuestions(result.technical);
    result.coding = prepareQuestions(result.coding);
    result.behavioral = prepareQuestions(result.behavioral);

    result.followUps = (result.followUps || []).map((group) => ({
      ...group,
      followUps: prepareQuestions(group.followUps),
    }));

    await Analysis.findByIdAndUpdate(state.analysisId, {
      "results.interview": result,
      "toolStatus.interview": "completed",
    });

    console.log("[Interview]: \n", result);

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Interview Questions",
      progress: 100,
      message: "Interview questions generated.",
      data: result,
    });

    state.interview = result;

    return state;
  }
}
