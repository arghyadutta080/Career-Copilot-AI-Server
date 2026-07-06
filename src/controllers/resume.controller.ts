import { createResume } from "../services/resume.service";

export async function uploadResume(req: any, res: any) {
  try {
    const userId = req.user.userId;

    const resume = await createResume(userId, req.file);

    return res.json({
      success: true,

      resume,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}
