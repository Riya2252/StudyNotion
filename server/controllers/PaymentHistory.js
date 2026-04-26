const PaymentRecord = require("../models/PaymentRecord");
const User = require("../models/User");
const { generateInvoice } = require("../utils/generateInvoice");
const { instance } = require("../config/razorpay");

// GET /api/v1/payment/history
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await PaymentRecord.countDocuments({ userId: req.user.id });
    const records = await PaymentRecord.find({ userId: req.user.id })
      .populate("courses", "courseName thumbnail instructor")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({ success: true, data: records, total, page: parseInt(page) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/payment/invoice/:paymentId  — download PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await PaymentRecord.findOne({
      _id: paymentId,
      userId: req.user.id,
    }).populate("courses", "courseName");

    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    const user = await User.findById(req.user.id).select("firstName lastName email");
    const pdfBuffer = await generateInvoice(payment, user);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${payment.razorpay_order_id}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });
    return res.send(pdfBuffer);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/payment/refund/:paymentId
exports.requestRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await PaymentRecord.findOne({ _id: paymentId, userId: req.user.id });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status !== "paid")
      return res.status(400).json({ success: false, message: "Only paid orders can be refunded" });

    // Razorpay refund
    const refund = await instance.payments.refund(payment.razorpay_payment_id, {
      amount: payment.amount, // full refund in paise
    });

    payment.status = "refunded";
    payment.refundId = refund.id;
    payment.refundReason = reason || "Requested by user";
    payment.refundedAt = new Date();
    await payment.save();

    return res.status(200).json({ success: true, message: "Refund initiated", data: payment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
