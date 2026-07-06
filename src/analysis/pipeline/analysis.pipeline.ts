import { ATSTool } from "../tools/ats/ats.tool";
import { AnalysisState } from "./pipeline.types";

export class AnalysisPipeline {
  async execute(state: AnalysisState) {
    const atsTool = new ATSTool();

    state = await atsTool.execute(state);

    return state;
  }
}
