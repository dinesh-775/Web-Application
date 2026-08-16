import Donation from "../models/Donation.js";
import { createReceipt } from "../services/receiptService.js";

export async function create(req, res) {
  try {
    const { donorName, email, phone, amount } = req.body;
    if (!donorName || !amount) {
      return res.status(400).json({ message: "Donor name and amount are required" });
    }

    const d = await Donation.create({
      donorName,
      email,
      phone,
      amount: Number(amount),
      paymentMethod: "UPI",
      status: "PENDING"
    });

    res.status(201).json({
      message: "Donation initiated. Complete simulated payment to confirm.",
      donation: d
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function demoSuccess(req, res) {
  try {
    // Only allow outside production
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Demo donation confirmations are disabled in production environment." });
    }

    const d = await Donation.findById(req.params.id);
    if (!d) return res.status(404).json({ message: "Donation not found" });

    if (d.status === "SUCCESS") {
      return res.status(400).json({ message: "Donation has already been processed successfully" });
    }

    // Generate unique transaction ID or check duplicates
    const transactionId = req.body.transactionId || `DEMO-DON-${Date.now()}`;
    const duplicate = await Donation.findOne({ transactionId, status: "SUCCESS" });
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate transaction ID detected. Donation protection triggered." });
    }

    d.status = "SUCCESS";
    d.transactionId = transactionId;

    const r = await createReceipt({
      type: "DONATION",
      donationId: d._id,
      amount: d.amount,
      paymentMethod: "UPI",
      transactionId: d.transactionId,
      email: d.email,
      festivalYear: d.festivalYear
    });

    d.receiptId = r._id;
    await d.save();

    res.json({ message: "Donation processed successfully", donation: d, receipt: r });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function list(req, res) {
  try {
    // Already route-restricted to admins
    const donations = await Donation.find().populate("receiptId", "receiptNumber").sort({ createdAt: -1 });
    res.json(donations);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}