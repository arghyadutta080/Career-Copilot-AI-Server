import { randomUUID } from "crypto";
import Analysis from "../../../models/Analysis";
import { llm } from "../../../llm/gemini";
import { sendEvent } from "../../../stream/sseManager";

import { AnalysisState } from "../../pipeline/pipeline.types";

import { LearningRoadmapSchema } from "./roadmap.schema";
import { buildRoadmapPrompt } from "./roadmap.prompt";
import { enrichRoadmapResources } from "../../../services/youtube/youtube.service";

export class RoadmapTool {
  async execute(state: AnalysisState): Promise<AnalysisState> {
    await Analysis.findByIdAndUpdate(state.analysisId, {
      $set: {
        "toolStatus.roadmap": "running",
      },
    });

    sendEvent(state.analysisId, {
      type: "progress",
      step: "Learning Roadmap",
      progress: 30,
      message: "Generating personalized roadmap...",
    });

    const structuredLLM = llm.gemini35Flash.withStructuredOutput(LearningRoadmapSchema).withConfig({
      runName: "Roadmap Generation Tool",
    });

    const llmResult = await structuredLLM.invoke(
      buildRoadmapPrompt(
        state.parsedResume,
        state.jobTitle!,
        state.company!,
        state.jobDescription,
        state.ats!,
        state.skillGap!,
        state.resumeOptimizer!,
        state.interview!,
      ),
    );

    // Deep-clone so we can mutate safely, then stamp every resource with a stable UUID.
    // The UUID is assigned here (not by the LLM) so the frontend can surgically update
    // only the url[] of each resource when enrichment completes.
    const result = JSON.parse(JSON.stringify(llmResult));
    for (const milestone of result.milestones ?? []) {
      for (const step of milestone.steps ?? []) {
        for (const resource of step.resources ?? []) {
          resource.id = randomUUID();
        }
      }
    }

    // Persist initial roadmap (urls = []) immediately so the UI can show the structure.
    await Analysis.findByIdAndUpdate(state.analysisId, {
      "results.roadmap": result,
      "toolStatus.roadmap": "completed",
    });

    console.log("[ROADMAP]: \n", result);

    // Send the full initial roadmap to the client — urls are [] so it shows skeletons.
    sendEvent(state.analysisId, {
      type: "progress",
      step: "Learning Roadmap",
      progress: 100,
      message: "Roadmap Generation Completed",
      data: result,
    });

    state.roadmap = result;

    // ── Background YouTube enrichment ─────────────────────────────────────────
    void (async () => {
      try {
        console.log(`[ROADMAP]: Starting background YouTube enrichment for analysis ${state.analysisId}`);

        // Returns a flat map { [resourceId]: string[] } — no full roadmap copy.
        const urlMap = await enrichRoadmapResources(result);

        // Build the enriched roadmap for MongoDB storage.
        const enrichedRoadmap = JSON.parse(JSON.stringify(result));
        for (const milestone of enrichedRoadmap.milestones ?? []) {
          for (const step of milestone.steps ?? []) {
            for (const resource of step.resources ?? []) {
              if (resource.id && urlMap[resource.id] !== undefined) {
                resource.urls = urlMap[resource.id];
              }
            }
          }
        }

        await Analysis.findByIdAndUpdate(state.analysisId, {
          $set: { "results.roadmap": enrichedRoadmap },
        });

        // Send only the lightweight urlMap — the frontend patches only what changed.
        sendEvent(state.analysisId, {
          type: "roadmap_resources_updated",
          step: "Learning Roadmap",
          message: "YouTube resources loaded.",
          data: urlMap,
        });

        console.log(`[ROADMAP]: Asynchronous YouTube enrichment completed for analysis ${state.analysisId}`);
      } catch (error) {
        console.error(`[ROADMAP]: Error in background YouTube enrichment for analysis ${state.analysisId}:`, error);
      }
    })();

    return state;
  }
}
