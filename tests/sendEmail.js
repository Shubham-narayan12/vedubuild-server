// testEmail.js
import dotenv from "dotenv";
dotenv.config();
import { sendEmail } from "../utils/sendemail.js";

(async () => {
  try {
    const result = await sendEmail(
      "er.aman614@gmail.com", // Change to your test email
      "Test OTP Email",
      "otpEmail", // The .hbs file name in /emailTemplates
      { otp: "123456", expiry: 5 } // Template variables
    );

    if (result.success) {
      console.log("✅ Test email sent successfully");
    } else {
      console.error("❌ Failed to send test email:", result.error);
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
})();
