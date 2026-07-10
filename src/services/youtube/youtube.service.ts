import { env } from "../../config/env";
import { LearningRoadmap } from "../../analysis/tools/roadmap/roadmap.schema";

/**
 * Searches YouTube for the top 2 videos matching the search query.
 * @param query The search query optimized for YouTube.
 * @returns An array of YouTube watch URLs.
 */
export async function searchVideos(query: string): Promise<string[]> {
  const apiKey = env.youtubeApiKey;
  if (!apiKey) {
    console.warn("[YOUTUBE SERVICE]: YOUTUBE_API_KEY is not configured.");
    return [];
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.append("part", "snippet");
  url.searchParams.append("type", "video");
  url.searchParams.append("maxResults", "2");
  url.searchParams.append("order", "relevance");
  url.searchParams.append("q", query);
  url.searchParams.append("relevanceLanguage", "en");
  url.searchParams.append("videoEmbeddable", "true");
  url.searchParams.append("safeSearch", "strict");
  url.searchParams.append("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`YouTube API request failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const items = data.items || [];
  const urls = items
    .map((item: any) => {
      const videoId = item.id?.videoId;
      return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
    })
    .filter((url: string | null): url is string => !!url);

  return urls;
}

/**
 * Traverses a learning roadmap and builds a flat map of resource id → YouTube URLs.
 * Individual failures are caught and logged; the rest of the resources continue.
 * @param roadmap The initial learning roadmap (resources must have an `id` field).
 * @returns A flat object mapping each resource id to its fetched YouTube URLs.
 */
export async function enrichRoadmapResources(
  roadmap: LearningRoadmap,
): Promise<Record<string, string[]>> {
  const urlMap: Record<string, string[]> = {};

  for (const milestone of roadmap.milestones || []) {
    for (const step of milestone.steps || []) {
      for (const resource of step.resources || []) {
        const id = resource.id;
        if (!id) continue;
        try {
          urlMap[id] = resource.query ? await searchVideos(resource.query) : [];
        } catch (error) {
          console.error(
            `[YOUTUBE SERVICE]: Failed to search video for query "${resource.query}":`,
            error,
          );
          urlMap[id] = [];
        }
      }
    }
  }

  return urlMap;
}
