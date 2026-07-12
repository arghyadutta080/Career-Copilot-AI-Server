import { AnalysisState } from "../../pipeline/pipeline.types";
import { llm } from "../../../llm/gemini";
import { buildSkillGapPrompt } from "./skillGap.prompt";
import { SkillGapSchema } from "./skillGap.schema";
import { sendEvent } from "../../../stream/sseManager";
import Analysis from "../../../models/Analysis";

export class SkillGapTool {
  async execute(state: AnalysisState) {
    await Analysis.findByIdAndUpdate(state.analysisId, {
      $set: {
        "toolStatus.skillGap": "running",
      },
    });

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Skill Gap",
      progress: 30,
      message: "Analyzing missing skills...",
    });

    const structuredLLM = llm.gemini35Flash.withStructuredOutput(SkillGapSchema).withConfig({
      runName: "Skill Gap Detection Tool",
    });

    const result = await structuredLLM.invoke(
      buildSkillGapPrompt(state.parsedResume, state.jobDescription),
    );

    await Analysis.findByIdAndUpdate(state.analysisId, {
      status: "running",
      "results.skillGap": result,
      "toolStatus.skillGap": "completed",
    });

    console.log("[SKILL GAP]: \n", result);

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Skill Gap",
      progress: 50,
      message: "Skill Gap analysis completed",
      data: result,
    });

    state.skillGap = result;

    return state;
  }
}
