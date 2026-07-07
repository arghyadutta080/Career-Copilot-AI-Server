import Analysis from "../../../models/Analysis";
import { llm } from "../../../llm/gemini";
import { sendEvent } from "../../../stream/sseManager";

import { AnalysisState } from "../../pipeline/pipeline.types";

import { LearningRoadmapSchema } from "./roadmap.schema";
import { buildRoadmapPrompt } from "./roadmap.prompt";

export class RoadmapTool {
  async execute(state: AnalysisState): Promise<AnalysisState> {
    sendEvent(state.analysisId, {
      type: "progress",
      step: "Learning Roadmap",
      progress: 99,
      message: "Generating personalized roadmap...",
    });

    const structuredLLM = llm.withStructuredOutput(LearningRoadmapSchema);

    const result = await structuredLLM.invoke(
      buildRoadmapPrompt(
        state.parsedResume,
        state.jobTitle!,
        state.company!,
        state.jobDescription,
        state.ats!,
        state.skillGap!,
        state.resumeOptimizer!,
        state.interview!,
      ),
    );

    await Analysis.findByIdAndUpdate(state.analysisId, {
      $set: {
        "results.roadmap": result,
        status: "completed",
      },
    });

    console.log("[ROADMAP]: \n", result);

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Learning Roadmap",
      progress: 100,
      message: "Analysis completed.",
      data: result,
    });

    state.roadmap = result;

    return state;
  }
}
