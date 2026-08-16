import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },

    amount: {
      type: Number,
      required: true,
      min: 10
    },

    paymentMethod: {
      type: String,
      enum: ["UPI"],
      default: "UPI"
    },

    transactionId: {
      type: String,
      trim: true,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PAYMENT_SUBMITTED",
        "SUCCESS",
        "REJECTED"
      ],
      default: "PENDING"
    },

    paymentSubmittedAt: {
      type: Date,
      default: null
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: ""
    },

    receiptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receipt",
      default: null
    },

    festivalYear: {
      type: Number,
      default: () => new Date().getFullYear()
    }
  },
  {
    timestamps: true
  }
);

// Prevent the same successful UPI transaction
// from being used for another donation.
donationSchema.index(
  { transactionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "SUCCESS",
      transactionId: { $type: "string" }
    }
  }
);

export default mongoose.model("Donation", donationSchema);