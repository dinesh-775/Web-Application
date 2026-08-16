import Donation from "../models/Donation.js";
import { createReceipt } from "../services/receiptService.js";

/*
|--------------------------------------------------------------------------
| CREATE DONATION
|--------------------------------------------------------------------------
| Donor creates a donation request.
|
| IMPORTANT:
| This does NOT create a successful donation.
| Status remains PENDING.
|--------------------------------------------------------------------------
*/
export async function create(req, res) {
  try {
    const {
      donorName,
      email,
      phone,
      amount
    } = req.body;

    if (!donorName || !donorName.trim()) {
      return res.status(400).json({
        message: "Donor name is required."
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required."
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        message: "Phone number is required."
      });
    }

    const donationAmount = Number(amount);

    if (
      !Number.isFinite(donationAmount) ||
      donationAmount < 10
    ) {
      return res.status(400).json({
        message: "Donation amount must be at least ₹10."
      });
    }

    const donation = await Donation.create({
      donorName: donorName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      amount: donationAmount,
      paymentMethod: "UPI",
      transactionId: "",
      status: "PENDING",
      paymentSubmittedAt: null,
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: "",
      receiptId: null
    });

    return res.status(201).json({
      message:
        "Donation request created. Please complete the UPI payment.",
      donation
    });
  } catch (error) {
    console.error("Create donation error:", error);

    return res.status(500).json({
      message: error.message || "Failed to create donation."
    });
  }
}


/*
|--------------------------------------------------------------------------
| SUBMIT PAYMENT
|--------------------------------------------------------------------------
| Donor clicks:
|
| "I Have Completed Payment"
|
| This ONLY changes:
|
| PENDING → PAYMENT_SUBMITTED
|
| It does NOT create a receipt.
| It does NOT mark the donation SUCCESS.
|--------------------------------------------------------------------------
*/
export async function submitPayment(req, res) {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found."
      });
    }

    if (donation.status === "SUCCESS") {
      return res.status(400).json({
        message: "This donation has already been approved."
      });
    }

    if (donation.status === "PAYMENT_SUBMITTED") {
      return res.status(400).json({
        message:
          "Payment has already been submitted and is waiting for admin verification."
      });
    }

    if (donation.status === "REJECTED") {
      return res.status(400).json({
        message:
          "This donation was rejected. Please create a new donation."
      });
    }

    donation.status = "PAYMENT_SUBMITTED";
    donation.paymentSubmittedAt = new Date();

    await donation.save();

    return res.json({
      message:
        "Payment submitted successfully. Your donation is now waiting for admin verification.",
      donation
    });
  } catch (error) {
    console.error("Submit donation payment error:", error);

    return res.status(500).json({
      message:
        error.message || "Failed to submit payment."
    });
  }
}


/*
|--------------------------------------------------------------------------
| LIST DONATIONS
|--------------------------------------------------------------------------
| Admin only.
|--------------------------------------------------------------------------
*/
export async function list(req, res) {
  try {
    const isAdmin = [
      "PRESIDENT",
      "VICE_PRESIDENT"
    ].includes(req.user.role);

    if (!isAdmin) {
      return res.status(403).json({
        message: "Admin access required."
      });
    }

    const donations = await Donation.find()
      .populate("verifiedBy", "name email role")
      .populate("receiptId", "receiptNumber")
      .sort({ createdAt: -1 });

    return res.json(donations);
  } catch (error) {
    console.error("List donations error:", error);

    return res.status(500).json({
      message:
        error.message || "Failed to load donations."
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET SINGLE DONATION
|--------------------------------------------------------------------------
*/
export async function getById(req, res) {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("verifiedBy", "name email role")
      .populate("receiptId", "receiptNumber");

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found."
      });
    }

    return res.json(donation);
  } catch (error) {
    console.error("Get donation error:", error);

    return res.status(500).json({
      message:
        error.message || "Failed to load donation."
    });
  }
}


/*
|--------------------------------------------------------------------------
| ADMIN APPROVE DONATION
|--------------------------------------------------------------------------
|
| PAYMENT_SUBMITTED → SUCCESS
|
| Admin MUST provide the REAL UPI transaction/reference ID.
|
| Receipt is generated ONLY here.
|--------------------------------------------------------------------------
*/
export async function approve(req, res) {
  try {
    const isAdmin = [
      "PRESIDENT",
      "VICE_PRESIDENT"
    ].includes(req.user.role);

    if (!isAdmin) {
      return res.status(403).json({
        message: "Only administrators can approve donations."
      });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found."
      });
    }

    if (donation.status !== "PAYMENT_SUBMITTED") {
      return res.status(400).json({
        message:
          "Only donations with submitted payments can be approved."
      });
    }

    const transactionId =
      typeof req.body.transactionId === "string"
        ? req.body.transactionId.trim()
        : "";

    if (!transactionId) {
      return res.status(400).json({
        message:
          "Actual UPI transaction/reference ID is required."
      });
    }

    if (transactionId.length < 4) {
      return res.status(400).json({
        message:
          "Please enter a valid transaction/reference ID."
      });
    }

    /*
     * Check whether this transaction ID has already
     * been successfully used.
     */
    const duplicate = await Donation.findOne({
      transactionId,
      status: "SUCCESS",
      _id: { $ne: donation._id }
    });

    if (duplicate) {
      return res.status(409).json({
        message:
          "This transaction ID has already been used for another successful donation."
      });
    }

    /*
     * Set transaction information.
     */
    donation.transactionId = transactionId;
    donation.status = "SUCCESS";
    donation.verifiedBy = req.user._id;
    donation.verifiedAt = new Date();
    donation.rejectionReason = "";

    await donation.save();

    /*
     * Generate receipt ONLY after successful admin approval.
     */
    const receipt = await createReceipt({
      type: "DONATION",
      donationId: donation._id,
      amount: donation.amount,
      paymentMethod: donation.paymentMethod,
      transactionId: donation.transactionId,
      email: donation.email,
      festivalYear: donation.festivalYear,
      recipientName: donation.donorName
    });

    /*
     * Attach receipt to donation.
     */
    donation.receiptId = receipt._id;

    await donation.save();

    return res.json({
      message:
        "Donation verified and approved successfully.",
      donation,
      receipt
    });
  } catch (error) {
    console.error("Approve donation error:", error);

    return res.status(500).json({
      message:
        error.message || "Failed to approve donation."
    });
  }
}


/*
|--------------------------------------------------------------------------
| ADMIN REJECT DONATION
|--------------------------------------------------------------------------
|
| PAYMENT_SUBMITTED → REJECTED
|--------------------------------------------------------------------------
*/
export async function reject(req, res) {
  try {
    const isAdmin = [
      "PRESIDENT",
      "VICE_PRESIDENT"
    ].includes(req.user.role);

    if (!isAdmin) {
      return res.status(403).json({
        message: "Only administrators can reject donations."
      });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found."
      });
    }

    if (donation.status !== "PAYMENT_SUBMITTED") {
      return res.status(400).json({
        message:
          "Only submitted donations can be rejected."
      });
    }

    const reason =
      typeof req.body.reason === "string"
        ? req.body.reason.trim()
        : "";

    if (!reason) {
      return res.status(400).json({
        message: "Rejection reason is required."
      });
    }

    donation.status = "REJECTED";
    donation.rejectionReason = reason;
    donation.verifiedBy = req.user._id;
    donation.verifiedAt = new Date();

    await donation.save();

    return res.json({
      message: "Donation rejected.",
      donation
    });
  } catch (error) {
    console.error("Reject donation error:", error);

    return res.status(500).json({
      message:
        error.message || "Failed to reject donation."
    });
  }
}