import mongoose from "mongoose";

// Payment schema definition
// Monetary amounts are stored in integer paise internally (1 Rupee = 100 Paise)
const PaymentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [1, "Payment amount must be greater than zero"],
    },
    paymentDate: {
      type: Date,
      required: [true, "Payment date is required"],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Card", "Other"],
      default: "UPI",
    },
    paymentType: {
      type: String,
      enum: ["Advance", "Partial", "Final"],
      default: "Partial",
    },
    referenceNumber: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite error in Next.js
const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
