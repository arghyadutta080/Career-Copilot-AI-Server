import Analysis from "../../../models/Analysis";
import { llm } from "../../../llm/gemini";
import { sendEvent } from "../../../stream/sseManager";

import { AnalysisState } from "../../pipeline/pipeline.types";

import { CoverLetterSchema } from "./coverLetter.schema";
import { buildCoverLetterPrompt } from "./coverLetter.prompt";

export class CoverLetterTool {
  async execute(state: AnalysisState): Promise<AnalysisState> {
    sendEvent(state.analysisId, {
      type: "progress",
      step: "Cover Letter",
      progress: 65,
      message: "Generating cover letter...",
    });

    const structuredLLM = llm.withStructuredOutput(CoverLetterSchema);

    const result = await structuredLLM.invoke(
      buildCoverLetterPrompt(
        state.parsedResume,
        state.jobTitle,
        state.company,
        state.jobDescription,
        state.ats!,
        state.skillGap!,
        state.resumeOptimizer!,
      ),
    );

    result.content = result.content.replace(/\\n/g, "\n").trim();

    await Analysis.findByIdAndUpdate(state.analysisId, {
      status: "running",
      "results.coverLetter": result,
    });

    console.log("[COVER LETTER]: \n", result);

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Cover Letter",
      progress: 75,
      message: "Cover letter generated.",
      data: result,
    });

    state.coverLetter = result;

    return state;
  }
}
