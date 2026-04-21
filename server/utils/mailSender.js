const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    let info = await transporter.sendMail({
        from: `StudyNotion <${process.env.MAIL_USER}>`,
        to: `${email}`,
        subject: `${title}`,
        html: `${body}`,
    });

    console.log("Email sent successfully:", info.response);
    return info;
}


module.exports = mailSender;