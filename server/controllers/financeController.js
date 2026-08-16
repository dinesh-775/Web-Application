import Payment from "../models/Payment.js";
import Donation from "../models/Donation.js";
import Expense from "../models/Expense.js";

export async function summary(req, res) {
  try {
    const [m, d, e] = await Promise.all([
      Payment.aggregate([
        { $match: { status: "SUCCESS" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Donation.aggregate([
        { $match: { status: "SUCCESS" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Expense.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    const memberContributions = m[0]?.total || 0;
    const donations = d[0]?.total || 0;
    const expenses = e[0]?.total || 0;

    res.json({
      memberContributions,
      donations,
      totalReceived: memberContributions + donations,
      expenses,
      remaining: Math.max((memberContributions + donations) - expenses, 0)
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
}