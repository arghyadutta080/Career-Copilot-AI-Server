import { Request, Response } from "express";
import { importJobFromUrl } from "./jobImport.service";

export const importJob = async (req: Request, res: Response): Promise<any> => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string" || !isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL." });
    }

    const jobDetails = await importJobFromUrl(url);

    return res.status(200).json(jobDetails);
  } catch (error: any) {
    if (error.message.startsWith("BAD_FETCH:")) {
      return res.status(502).json({ error: "Failed to fetch the webpage." });
    }
    if (error.message.startsWith("NO_CONTENT:")) {
      return res.status(422).json({ error: "Unable to extract meaningful job information from the provided webpage." });
    }
    
    console.error("Import Job Error:", error);
    return res.status(500).json({ error: "Unexpected extraction error." });
  }
};

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
}
