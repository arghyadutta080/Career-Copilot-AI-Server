import { ATSTool } from "../tools/ats/ats.tool";
import { ResumeOptimizerTool } from "../tools/resume-optimizer/optimizer.tool";
import { SkillGapTool } from "../tools/skill-gap/skillGap.tool";
import { AnalysisState } from "./pipeline.types";

export class AnalysisPipeline {
  async execute(state: AnalysisState) {
    const ats = new ATSTool();
    state = await ats.execute(state);

    const skillGap = new SkillGapTool();
    state = await skillGap.execute(state);

    const optimizer = new ResumeOptimizerTool();
    state = await optimizer.execute(state);

    return state;
  }
}
