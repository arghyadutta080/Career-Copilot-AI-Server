import { Router } from "express";
import { auth } from "../middlewares/auth";
import Analysis from "../models/Analysis";

const router = Router();

// Route to delete a specific analysis by ID
router.delete("/:analysisId", auth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { analysisId } = req.params;

    const analysis = await Analysis.findOneAndDelete({ _id: analysisId, userId });
    
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    return res.json({ success: true, message: "Analysis deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
