import AuditLog from "../models/AuditLog.js";

export async function list(req, res) {
  try {
    const logs = await AuditLog.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}
