const express = require("express")
const router = express.Router()

const { capturePayment, verifyPayment, sendPaymentSuccessEmail } = require("../controllers/Payments")
const { getPaymentHistory, downloadInvoice, requestRefund } = require("../controllers/PaymentHistory")
const { auth, isStudent } = require("../middlewares/auth")

router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifyPayment", auth, isStudent, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail)

// Payment history & invoice
router.get("/history", auth, getPaymentHistory)
router.get("/invoice/:paymentId", auth, downloadInvoice)
router.post("/refund/:paymentId", auth, isStudent, requestRefund)

module.exports = router