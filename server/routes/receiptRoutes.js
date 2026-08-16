import { Router } from "express";
import { list, download } from "../controllers/receiptController.js";
import { auth, optionalAuth } from "../middleware/auth.js";

const r = Router();

r.get("/", auth, list);
r.get("/:id/download", optionalAuth, download);

export default r;
