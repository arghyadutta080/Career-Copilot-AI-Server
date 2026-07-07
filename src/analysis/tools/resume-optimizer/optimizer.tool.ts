import Analysis from "../../../models/Analysis";
import { llm } from "../../../llm/gemini";
import { sendEvent } from "../../../stream/sseManager";

import { AnalysisState } from "../../pipeline/pipeline.types";

import { ResumeOptimizerSchema } from "./optimizer.schema";
import { buildResumeOptimizerPrompt } from "./optimizer.prompt";

export class ResumeOptimizerTool {
  async execute(state: AnalysisState): Promise<AnalysisState> {
    await Analysis.findByIdAndUpdate(state.analysisId, {
      $set: {
        "toolStatus.optimizer": "running",
      },
    });
    
    sendEvent(state.analysisId, {
      type: "progress",
      step: "Resume Optimizer",
      progress: 55,
      message: "Optimizing resume...",
    });

    const structuredLLM = llm.withStructuredOutput(ResumeOptimizerSchema);

    const result = await structuredLLM.invoke(
      buildResumeOptimizerPrompt(
        state.rawResume,
        state.parsedResume,
        state.jobDescription,
        state.ats!,
        state.skillGap!,
      ),
    );

    await Analysis.findByIdAndUpdate(state.analysisId, {
      status: "running",
      "results.optimizer": result,
      "toolStatus.optimizer": "completed",
    });

    console.log("[OPTIMIZER]: \n", result);

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Resume Optimizer",
      progress: 75,
      message: "Resume optimization completed.",
      data: result,
    });

    state.resumeOptimizer = result;

    return state;
  }
}
