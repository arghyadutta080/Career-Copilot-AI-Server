import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "src/uploads/");
  },

  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(null, `${uuid()}${ext}`);
  },
});

export const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_, file, cb) => {
    const allowed = [
      "application/pdf",

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    cb(null, allowed.includes(file.mimetype));
  },
});
