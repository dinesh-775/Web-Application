import Member from "../models/Member.js";
import Payment from "../models/Payment.js";
import AuditLog from "../models/AuditLog.js";

export async function me(req, res) {
  try {
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return res.status(404).json({ message: "Member profile not found" });

    const paid = (await Payment.aggregate([
      { $match: { memberId: member._id, status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]))[0]?.total || 0;

    res.json({
      member,
      paid,
      remaining: Math.max(member.contributionAmount - paid, 0)
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { phone, address, occupation } = req.body;
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return res.status(404).json({ message: "Member profile not found" });

    const oldValue = `Phone: ${member.phone}, Address: ${member.address}, Occupation: ${member.occupation}`;

    if (phone !== undefined) member.phone = phone;
    if (address !== undefined) member.address = address;
    if (occupation !== undefined) member.occupation = occupation;

    await member.save();

    res.json({ message: "Profile updated successfully", member });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function updateContribution(req, res) {
  try {
    const m = await Member.findById(req.params.id);
    if (!m) return res.status(404).json({ message: "Member not found" });

    const oldAmount = m.contributionAmount;
    m.contributionAmount = Number(req.body.amount);
    await m.save();

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: "UPDATE_MEMBER_CONTRIBUTION",
      entity: "Member",
      entityId: m._id.toString(),
      oldValue: `Old contribution: ₹${oldAmount}`,
      newValue: `New contribution: ₹${m.contributionAmount}`
    });

    res.json(m);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function list(req, res) {
  try {
    // Restricting to Admin at route level
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
}