import { Router } from "express";

const router = Router();

router.get("/", (_, res) => {
    return res.status(200).json({
        success: true,
        service: "CareerCopilot API",
        status: "healthy",
        timestamp: new Date(),
    });
});

export default router;