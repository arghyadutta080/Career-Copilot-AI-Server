import { ATSTool } from "../tools/ats/ats.tool";
import { CoverLetterTool } from "../tools/cover-letter/coverLetter.tool";
import { InterviewTool } from "../tools/interview/interview.tool";
import { ResumeOptimizerTool } from "../tools/resume-optimizer/optimizer.tool";
import { RoadmapTool } from "../tools/roadmap/roadmap.tool";
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

    const coverLetter = new CoverLetterTool();
    state = await coverLetter.execute(state);

    const interview = new InterviewTool();
    state = await interview.execute(state);

    const roadmap = new RoadmapTool();
    state = await roadmap.execute(state);

    return state;
  }
}
