import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import AuditLog from "../models/AuditLog.js";
import { createReceipt } from "../services/receiptService.js";

export async function create(req, res) {
  try {
    const m = await Member.findOne({ userId: req.user._id });
    if (!m) return res.status(404).json({ message: "Member not found" });

    const amount = Number(req.body.amount);
    if (!amount || amount < 1) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const paymentMethod = req.body.paymentMethod || "UPI";
    const referenceNumber = req.body.referenceNumber || "";

    const p = await Payment.create({
      memberId: m._id,
      amount,
      paymentMethod,
      referenceNumber: paymentMethod === "CASH" ? referenceNumber : undefined,
      status: "PENDING", // Cash always starts as PENDING. UPI also starts as PENDING until confirmed.
      festivalYear: m.festivalYear
    });

    res.status(201).json({
      message: paymentMethod === "CASH" 
        ? "Cash payment request submitted. It will remain PENDING until verified by an administrator."
        : "Payment created. Complete simulated payment to confirm.",
      payment: p
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function demoSuccess(req, res) {
  try {
    // Only allow outside production
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Demo payment confirmations are disabled in production environment." });
    }

    const p = await Payment.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Payment not found" });

    if (p.paymentMethod !== "UPI") {
      return res.status(400).json({ message: "Demo success endpoint is for UPI payments only" });
    }

    if (p.status === "SUCCESS") {
      return res.status(400).json({ message: "Payment has already been processed successfully" });
    }

    // Generate unique transaction ID or check duplicates
    const transactionId = req.body.transactionId || `DEMO-${Date.now()}`;
    const duplicate = await Payment.findOne({ transactionId, status: "SUCCESS" });
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate transaction ID detected. Payment protection triggered." });
    }

    p.status = "SUCCESS";
    p.transactionId = transactionId;
    await p.save();

    const m = await Member.findById(p.memberId);
    const r = await createReceipt({
      type: "MEMBER_PAYMENT",
      memberId: m._id,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      email: m.email,
      festivalYear: m.festivalYear
    });

    res.json({ message: "Demo payment successful", payment: p, receipt: r });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function list(req, res) {
  try {
    const isAdmin = ["PRESIDENT", "VICE_PRESIDENT"].includes(req.user.role);
    if (isAdmin) {
      const payments = await Payment.find()
        .populate("memberId", "name memberId")
        .sort({ createdAt: -1 });
      return res.json(payments);
    } else {
      const member = await Member.findOne({ userId: req.user._id });
      if (!member) {
        return res.status(404).json({ message: "Member profile not found" });
      }
      const payments = await Payment.find({ memberId: member._id })
        .populate("memberId", "name memberId")
        .sort({ createdAt: -1 });
      return res.json(payments);
    }
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function approveCash(req, res) {
  try {
    const p = await Payment.findById(req.params.id);
    if (!p || p.paymentMethod !== "CASH") {
      return res.status(404).json({ message: "Cash payment record not found" });
    }

    if (p.status === "SUCCESS") {
      return res.status(400).json({ message: "Payment has already been approved" });
    }

    p.status = "SUCCESS";
    p.verifiedBy = req.user._id;
    p.verifiedAt = new Date();
    p.transactionId = p.referenceNumber || `CASH-${Date.now()}`;
    await p.save();

    const m = await Member.findById(p.memberId);
    const r = await createReceipt({
      type: "MEMBER_PAYMENT",
      memberId: m._id,
      amount: p.amount,
      paymentMethod: "CASH",
      transactionId: p.transactionId,
      email: m.email,
      festivalYear: m.festivalYear
    });

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "APPROVE_CASH_PAYMENT",
      entity: "Payment",
      entityId: p._id.toString(),
      newValue: `Approved Cash payment of ₹${p.amount} for member: ${m.name} (${m.memberId})`
    });

    res.json({ message: "Cash payment approved and verified.", receipt: r });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}