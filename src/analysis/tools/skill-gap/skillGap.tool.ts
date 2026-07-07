import { AnalysisState } from "../../pipeline/pipeline.types";
import { llm } from "../../../llm/gemini";
import { buildSkillGapPrompt } from "./skillGap.prompt";
import { SkillGapSchema } from "./skillGap.schema";
import { sendEvent } from "../../../stream/sseManager";
import Analysis from "../../../models/Analysis";

export class SkillGapTool {
  async execute(state: AnalysisState) {
    sendEvent(state.analysisId, {
      type: "progress",
      step: "Skill Gap",
      progress: 25,
      message: "Analyzing missing skills...",
    });

    const structuredLLM = llm.withStructuredOutput(SkillGapSchema);

    const result = await structuredLLM.invoke(
      buildSkillGapPrompt(state.rawResume, state.jobDescription),
    );

    await Analysis.findByIdAndUpdate(state.analysisId, {
      status: "running",
      "results.skillGap": result,
    });

    console.log("[SKILL GAP]: \n", result);

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Skill Gap",
      progress: 35,
      message: "Skill Gap analysis completed",
      data: result,
    });

    state.skillGap = result;

    return state;
  }
}
