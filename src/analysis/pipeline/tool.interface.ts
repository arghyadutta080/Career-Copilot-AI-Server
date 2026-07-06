import { AnalysisState } from "./pipeline.types";

export interface AnalysisTool {
  readonly name: string;

  execute(state: AnalysisState): Promise<AnalysisState>;
}
