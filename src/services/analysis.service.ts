import { sendEvent } from "../stream/sseManager";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const fakeAnalysis = async (analysisId: string) => {
  sendEvent(analysisId, {
    type: "progress",
    step: "resume",
    message: "Parsing Resume",
    progress: 20,
  });

  await sleep(2000);

  sendEvent(analysisId, {
    type: "progress",
    step: "ats",
    message: "Calculating ATS",
    progress: 50,
  });

  await sleep(2000);

  sendEvent(analysisId, {
    type: "progress",
    step: "interview",
    message: "Generating Questions",
    progress: 80,
  });

  await sleep(2000);

  sendEvent(analysisId, {
    type: "complete",
    step: "done",
    message: "Completed",
    progress: 100,
  });
}
