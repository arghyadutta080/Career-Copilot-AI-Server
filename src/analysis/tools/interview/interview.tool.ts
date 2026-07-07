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
      progress: 80,
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

    result.hr = assignIds(result.hr);
    result.resumeBased = assignIds(result.resumeBased);
    result.experienceBased = assignIds(result.experienceBased);
    result.projectBased = assignIds(result.projectBased);
    result.technical = assignIds(result.technical);
    result.coding = assignIds(result.coding);
    result.behavioral = assignIds(result.behavioral);

    result.followUps = result.followUps.map((group) => ({
      ...group,
      followUps: assignIds(group.followUps),
    }));

    await Analysis.findByIdAndUpdate(state.analysisId, {
      "results.interview": result,
      "toolStatus.interview": "completed",
    });

    console.log("[Interview]: \n", result);

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Interview Questions",
      progress: 90,
      message: "Interview questions generated.",
      data: result,
    });

    state.interview = result;

    return state;
  }
}
