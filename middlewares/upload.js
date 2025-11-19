import multer from "multer";

const storage = multer.memoryStorage();  // file RAM me store hogi

export const upload = multer({ storage });