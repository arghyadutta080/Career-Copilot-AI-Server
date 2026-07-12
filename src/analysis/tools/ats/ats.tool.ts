import { llm } from "../../../llm/gemini";
import { ATSResultSchema } from "./ats.schema";
import { buildATSPrompt } from "./ats.prompt";
import Analysis from "../../../models/Analysis";
import { sendEvent } from "../../../stream/sseManager";
import { AnalysisState } from "../../pipeline/pipeline.types";

export class ATSTool {
  async execute(state: AnalysisState): Promise<AnalysisState> {
    await Analysis.findByIdAndUpdate(state.analysisId, {
      $set: {
        "toolStatus.ats": "running",
      },
    });
    
    sendEvent(state.analysisId, {
      type: "progress",
      step: "ATS",
      message: "Calculating ATS score...",
      progress: 10,
    });

    const structuredLLM = llm.gemini35Flash.withStructuredOutput(ATSResultSchema).withConfig({
      runName: "ATS Score Calculation Tool",
    });

    const result = await structuredLLM.invoke(
      buildATSPrompt(state.rawResume, state.jobDescription),
    );

    await Analysis.findByIdAndUpdate(state.analysisId, {
      status: "running",
      "results.ats": result,
      "toolStatus.ats": "completed",
    });

    console.log("[ATS]: \n", result);

    sendEvent(state.analysisId, {
      type: "progress",
      step: "ATS",
      message: "ATS Score Calculation completed",
      progress: 25,
      data: result,
    });

    state.ats = result;

    return state;
  }
}
