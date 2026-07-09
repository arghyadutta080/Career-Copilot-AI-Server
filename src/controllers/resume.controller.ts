import { createResume, getResumeById, getAllResumes as getAllResumesService, deleteResumeById } from "../services/resume.service";

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

export async function getResume(req: any, res: any) {
  try {
    const userId = req.user.userId;
    const { resumeId } = req.params;

    const resume = await getResumeById(userId, resumeId);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    return res.json(resume);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAllResumes(req: any, res: any) {
  try {
    const userId = req.user.userId;
    const resumes = await getAllResumesService(userId);
    return res.json(resumes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteResume(req: any, res: any) {
  try {
    const userId = req.user.userId;
    const { resumeId } = req.params;

    const result = await deleteResumeById(userId, resumeId);
    if (!result) {
      return res.status(404).json({ error: "Resume not found" });
    }

    return res.json({ success: true, message: "Resume deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
