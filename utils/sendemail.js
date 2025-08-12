import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".hbs",
      layoutsDir: path.resolve("./templates"),
      defaultLayout: false,
      partialsDir: path.resolve("./templates"),
    },
    viewPath: path.resolve("./templates"),
    extName: ".hbs",
  })
);

/**
 * Send an email
 * @param {string} to - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} template - template filename without .hbs
 * @param {object} context - variables for template
 */
export async function sendEmail(to, subject, template, context = {}) {
  try {
    const mailOptions = {
      from: `"Vedubuild" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      template,
      context,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
