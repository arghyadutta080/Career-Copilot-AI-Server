import { Router } from "express";

import { addClient, removeClient, sendEvent } from "../stream/sseManager";
import { fakeAnalysis } from "../services/analysis.service";

const router = Router();

router.get(
  "/:analysisId",

  (req, res) => {
    const id = req.params.analysisId;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",

      "Cache-Control": "no-cache",

      Connection: "keep-alive",
    });

    addClient(id, res);

    req.on("close", () => {
      removeClient(id);
    });
  },
);

router.post(
  "/test/:analysisId",

  async (req, res) => {
    const analysisId = req.params.analysisId;

    fakeAnalysis(analysisId);

    return res.json({
      success: true,
      message: "Fake analysis started",
    });
  },
);

export default router;
