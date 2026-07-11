import { Router } from "express";

import { addClient, removeClient, sendEvent } from "../stream/sseManager";
// import { fakeAnalysis } from "../analysis/services/analysis.service";

const router = Router();

router.get(
  "/:analysisId",

  (req, res) => {
    const id = req.params.analysisId;

    // Use res.set() instead of res.writeHead() so the CORS middleware
    // (which runs before this handler) keeps the Access-Control-Allow-Origin
    // headers it already set. res.writeHead() would overwrite those headers.
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering if behind a proxy
    });
    res.flushHeaders(); // Flush headers immediately to start the SSE stream

    // Send a heartbeat comment so the browser recognises the connection is live
    res.write(": heartbeat\n\n");

    addClient(id, res);

    req.on("close", () => {
      removeClient(id);
    });
  },
);

// router.post(
//   "/test/:analysisId",

//   async (req, res) => {
//     const analysisId = req.params.analysisId;

//     fakeAnalysis(analysisId);

//     return res.json({
//       success: true,
//       message: "Fake analysis started",
//     });
//   },
// );

export default router;
