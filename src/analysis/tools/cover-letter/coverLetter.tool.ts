import Analysis from "../../../models/Analysis";
import { llm } from "../../../llm/gemini";
import { sendEvent } from "../../../stream/sseManager";

import { AnalysisState } from "../../pipeline/pipeline.types";

import { CoverLetterSchema } from "./coverLetter.schema";
import { buildCoverLetterPrompt } from "./coverLetter.prompt";

export class CoverLetterTool {
  async execute(state: AnalysisState): Promise<AnalysisState> {
    await Analysis.findByIdAndUpdate(state.analysisId, {
      $set: {
        "toolStatus.coverLetter": "running",
      },
    });

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Cover Letter",
      progress: 80,
      message: "Generating cover letter...",
    });

    const structuredLLM = llm.withStructuredOutput(CoverLetterSchema).withConfig({
      runName: "Cover Letter Generation Tool",
    });

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
      status: "completed",
      "results.coverLetter": result,
      "toolStatus.coverLetter": "completed",
    });

    console.log("[COVER LETTER]: \n", result);

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Cover Letter",
      progress: 100,
      message: "Cover letter generated.",
      data: result,
    });

    state.coverLetter = result;

    return state;
  }
}
