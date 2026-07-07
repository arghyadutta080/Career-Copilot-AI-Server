import { llm } from "../../../llm/gemini";
import { ATSResultSchema } from "./ats.schema";
import { buildATSPrompt } from "./ats.prompt";
import Analysis from "../../../models/Analysis";
import { sendEvent } from "../../../stream/sseManager";
import { AnalysisState } from "../../pipeline/pipeline.types";

export class ATSTool {
  async execute(state: AnalysisState): Promise<AnalysisState> {
    sendEvent(state.analysisId, {
      type: "progress",
      step: "ATS",
      message: "Calculating ATS score...",
      progress: 10,
    });

    const structuredLLM = llm.withStructuredOutput(ATSResultSchema);

    const result = await structuredLLM.invoke(
      buildATSPrompt(state.rawResume, state.jobDescription),
    );

    await Analysis.findByIdAndUpdate(state.analysisId, {
      status: "running",
      "results.ats": result,
    });

    console.log("[ATS]: \n",result)

    sendEvent(state.analysisId, {
      type: "progress",
      step: "ATS",
      message: "ATS Score Calculation completed",
      progress: 20,
      data: result,
    });

    state.ats = result;

    return state;
  }
}
