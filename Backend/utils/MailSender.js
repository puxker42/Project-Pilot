const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, subject, body) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"Electronics Projects Portal" <${process.env.MAIL_ID}>`,
      to: email,
      subject: subject,
      html: body,
    });

    return info;
  } catch (error) {
    console.error("Error in sending email:", error);
    throw error;
  }
};

module.exports = mailSender;
