import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import AuditLog from "../models/AuditLog.js";
import { createReceipt } from "../services/receiptService.js";

/*
|--------------------------------------------------------------------------
| CREATE PAYMENT
|--------------------------------------------------------------------------
| Creates a PENDING member payment.
|
| UPI:
|   PENDING -> demoSuccess -> SUCCESS
|
| CASH:
|   PENDING -> approveCash -> SUCCESS
|
*/

export async function create(req, res) {
  try {
    const member = await Member.findOne({
      userId: req.user._id
    });

    if (!member) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount < 1) {
      return res.status(400).json({
        message: "Invalid amount"
      });
    }

    const paymentMethod =
      req.body.paymentMethod || "UPI";

    const referenceNumber =
      req.body.referenceNumber || "";

    if (!["UPI", "CASH"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method"
      });
    }

    /*
     * Only CASH payments store referenceNumber.
     * UPI gets transactionId only after confirmation.
     */

    const payment = await Payment.create({
      memberId: member._id,
      amount,
      paymentMethod,

      referenceNumber:
        paymentMethod === "CASH"
          ? referenceNumber
          : undefined,

      status: "PENDING",

      festivalYear: member.festivalYear
    });

    return res.status(201).json({
      message:
        paymentMethod === "CASH"
          ? "Cash payment request submitted. It will remain PENDING until verified by an administrator."
          : "Payment created. Complete the UPI payment to confirm.",
      payment
    });

  } catch (error) {
    console.error(
      "CREATE PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Server error while creating payment"
    });
  }
}


/*
|--------------------------------------------------------------------------
| DEMO SUCCESS - UPI
|--------------------------------------------------------------------------
| IMPORTANT:
| This endpoint is only for your current demo system.
|
| Production should use actual payment-provider
| verification/webhooks instead of trusting the button.
|
*/

export async function demoSuccess(req, res) {
  try {

    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        message:
          "Demo payment confirmations are disabled in production environment."
      });
    }

    const payment = await Payment.findById(
      req.params.id
    );

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    if (payment.paymentMethod !== "UPI") {
      return res.status(400).json({
        message:
          "Demo success endpoint is for UPI payments only"
      });
    }

    if (payment.status === "SUCCESS") {
      return res.status(400).json({
        message:
          "Payment has already been processed successfully"
      });
    }

    /*
     * Use supplied transactionId if available.
     * Otherwise generate one.
     */

    const transactionId =
      req.body?.transactionId ||
      `DEMO-${Date.now()}`;

    /*
     * Check duplicate transaction IDs.
     */

    const duplicate =
      await Payment.findOne({
        transactionId,
        status: "SUCCESS",
        _id: {
          $ne: payment._id
        }
      });

    if (duplicate) {
      return res.status(409).json({
        message:
          "Duplicate transaction ID detected. Payment protection triggered."
      });
    }

    /*
     * Get member BEFORE changing payment status.
     */

    const member =
      await Member.findById(
        payment.memberId
      );

    if (!member) {
      return res.status(404).json({
        message:
          "Member associated with payment not found"
      });
    }

    /*
     * Mark payment successful.
     */

    payment.status = "SUCCESS";

    payment.transactionId =
      transactionId;

    await payment.save();

    /*
     * Generate receipt.
     */

    const receipt =
      await createReceipt({
        type: "MEMBER_PAYMENT",

        memberId: member._id,

        amount: payment.amount,

        paymentMethod:
          payment.paymentMethod,

        transactionId:
          payment.transactionId,

        email: member.email,

        festivalYear:
          member.festivalYear
      });

    /*
     * Connect receipt to payment.
     */

    payment.receiptId =
      receipt._id;

    await payment.save();

    return res.json({
      message:
        "UPI payment successful",

      payment,

      receipt
    });

  } catch (error) {
    console.error(
      "DEMO PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Server error while confirming payment"
    });
  }
}


/*
|--------------------------------------------------------------------------
| LIST PAYMENTS
|--------------------------------------------------------------------------
*/

export async function list(req, res) {
  try {

    const isAdmin =
      [
        "PRESIDENT",
        "VICE_PRESIDENT"
      ].includes(req.user.role);

    /*
     * ADMIN
     */

    if (isAdmin) {

      const payments =
        await Payment.find()
          .populate(
            "memberId",
            "name memberId"
          )
          .populate(
            "receiptId",
            "receiptNumber"
          )
          .sort({
            createdAt: -1
          });

      return res.json(payments);
    }

    /*
     * MEMBER
     */

    const member =
      await Member.findOne({
        userId: req.user._id
      });

    if (!member) {
      return res.status(404).json({
        message:
          "Member profile not found"
      });
    }

    const payments =
      await Payment.find({
        memberId: member._id
      })
        .populate(
          "memberId",
          "name memberId"
        )
        .populate(
          "receiptId",
          "receiptNumber"
        )
        .sort({
          createdAt: -1
        });

    return res.json(payments);

  } catch (error) {

    console.error(
      "LIST PAYMENTS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Server error while loading payments"
    });
  }
}


/*
|--------------------------------------------------------------------------
| APPROVE CASH PAYMENT
|--------------------------------------------------------------------------
*/

export async function approveCash(req, res) {
  try {

    const payment =
      await Payment.findById(
        req.params.id
      );

    if (
      !payment ||
      payment.paymentMethod !== "CASH"
    ) {
      return res.status(404).json({
        message:
          "Cash payment record not found"
      });
    }

    if (payment.status === "SUCCESS") {
      return res.status(400).json({
        message:
          "Payment has already been approved"
      });
    }

    /*
     * Determine transaction/reference ID.
     */

    const transactionId =
      payment.referenceNumber ||
      `CASH-${Date.now()}`;

    /*
     * Check duplicate transaction ID.
     */

    const duplicate =
      await Payment.findOne({
        transactionId,
        status: "SUCCESS",
        _id: {
          $ne: payment._id
        }
      });

    if (duplicate) {
      return res.status(409).json({
        message:
          "Duplicate transaction/reference number detected."
      });
    }

    /*
     * Get member.
     */

    const member =
      await Member.findById(
        payment.memberId
      );

    if (!member) {
      return res.status(404).json({
        message:
          "Member associated with payment not found"
      });
    }

    /*
     * Mark successful.
     */

    payment.status = "SUCCESS";

    payment.verifiedBy =
      req.user._id;

    payment.verifiedAt =
      new Date();

    payment.transactionId =
      transactionId;

    await payment.save();

    /*
     * Generate receipt.
     */

    const receipt =
      await createReceipt({
        type: "MEMBER_PAYMENT",

        memberId: member._id,

        amount: payment.amount,

        paymentMethod: "CASH",

        transactionId:
          payment.transactionId,

        email: member.email,

        festivalYear:
          member.festivalYear
      });

    /*
     * Connect receipt.
     */

    payment.receiptId =
      receipt._id;

    await payment.save();

    /*
     * Audit log.
     */

    await AuditLog.create({
      userId: req.user._id,

      action:
        "APPROVE_CASH_PAYMENT",

      entity: "Payment",

      entityId:
        payment._id.toString(),

      newValue:
        `Approved Cash payment of ₹${payment.amount} for member: ${member.name} (${member.memberId})`
    });

    return res.json({
      message:
        "Cash payment approved and verified.",

      payment,

      receipt
    });

  } catch (error) {

    console.error(
      "APPROVE CASH PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Server error while approving cash payment"
    });
  }
}