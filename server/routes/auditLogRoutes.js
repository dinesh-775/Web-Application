import { Router } from "express";
import { list } from "../controllers/auditLogController.js";
import { auth, roles } from "../middleware/auth.js";

const r = Router();

r.get("/", auth, roles("PRESIDENT", "VICE_PRESIDENT"), list);

export default r;
