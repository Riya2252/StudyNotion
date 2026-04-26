const mongoose = require("mongoose");

const paymentRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    amount: { type: Number, required: true }, // in paise
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "refunded", "failed"],
      default: "created",
    },
    refundId: { type: String },
    refundReason: { type: String },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentRecord", paymentRecordSchema);
