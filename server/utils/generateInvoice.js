const PDFDocument = require("pdfkit");

/**
 * Generates a PDF invoice buffer for a payment record.
 * @param {Object} payment - PaymentRecord document (populated)
 * @param {Object} user    - User document
 * @returns {Promise<Buffer>}
 */
exports.generateInvoice = (payment, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("StudyNotion", { align: "center" })
      .moveDown(0.5);

    doc.fontSize(14).font("Helvetica").text("Payment Invoice", { align: "center" }).moveDown(1.5);

    // Invoice meta
    const invoiceDate = new Date(payment.createdAt).toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric",
    });
    doc
      .fontSize(11)
      .text(`Invoice Date: ${invoiceDate}`)
      .text(`Order ID: ${payment.razorpay_order_id}`)
      .text(`Payment ID: ${payment.razorpay_payment_id || "N/A"}`)
      .text(`Status: ${payment.status.toUpperCase()}`)
      .moveDown(1);

    // Bill to
    doc
      .font("Helvetica-Bold")
      .text("Bill To:")
      .font("Helvetica")
      .text(`${user.firstName} ${user.lastName}`)
      .text(user.email)
      .moveDown(1);

    // Items table header
    doc.font("Helvetica-Bold");
    doc.text("Course", 50, doc.y, { continued: true, width: 350 });
    doc.text("Amount", { align: "right" });
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

    // Items
    doc.font("Helvetica");
    const courses = payment.courses || [];
    const perCourse = courses.length > 0 ? payment.amount / courses.length / 100 : payment.amount / 100;
    courses.forEach((course) => {
      doc.text(course.courseName || "Course", 50, doc.y, { continued: true, width: 350 });
      doc.text(`₹${perCourse.toFixed(2)}`, { align: "right" });
    });

    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke().moveDown(0.5);

    // Total
    const total = (payment.amount / 100).toFixed(2);
    doc.font("Helvetica-Bold");
    doc.text("Total", 50, doc.y + 8, { continued: true, width: 350 });
    doc.text(`₹${total}`, { align: "right" });

    if (payment.status === "refunded") {
      doc.moveDown(1).font("Helvetica").fillColor("red")
        .text(`Refunded on: ${new Date(payment.refundedAt).toLocaleDateString("en-IN")}`)
        .text(`Reason: ${payment.refundReason || "N/A"}`);
    }

    doc.moveDown(2).fillColor("grey").fontSize(9)
      .text("Thank you for learning with StudyNotion!", { align: "center" });

    doc.end();
  });
};
