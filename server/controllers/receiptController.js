import path from "path";
import fs from "fs";
import Receipt from "../models/Receipt.js";
import Member from "../models/Member.js";

// List receipts
export async function list(req, res) {
  try {
    const isAdmin = ["PRESIDENT", "VICE_PRESIDENT"].includes(req.user?.role);
    if (isAdmin) {
      const receipts = await Receipt.find()
        .populate("memberId", "name memberId")
        .populate("donationId", "donorName")
        .sort({ createdAt: -1 });
      return res.json(receipts);
    } else {
      const member = await Member.findOne({ userId: req.user._id });
      if (!member) {
        return res.status(404).json({ message: "Member profile not found" });
      }
      const receipts = await Receipt.find({ memberId: member._id })
        .populate("memberId", "name memberId")
        .sort({ createdAt: -1 });
      return res.json(receipts);
    }
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

// Download receipt
export async function download(req, res) {
  try {
    const { id } = req.params;
    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    if (receipt.type === "MEMBER_PAYMENT") {
      // Must be authenticated to access member payment receipts
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const isAdmin = ["PRESIDENT", "VICE_PRESIDENT"].includes(req.user.role);
      if (!isAdmin) {
        const member = await Member.findOne({ userId: req.user._id });
        if (!member || receipt.memberId.toString() !== member._id.toString()) {
          return res.status(403).json({ message: "Forbidden: You cannot access this receipt" });
        }
      }
    }

    // Verify file exists
    const resolvedPath = path.resolve(receipt.pdfPath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: "Receipt PDF file not found on server" });
    }

    res.sendFile(resolvedPath);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}
