// tests/sendSms.js
import dotenv from "dotenv";
dotenv.config();
import twilio from "twilio";

console.log("Loaded SID from env:", process.env.TWILIO_ACCOUNT_SID);

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const to='+918092144877';

(async () => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const message = await client.messages.create({
      body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log("✅ OTP SMS sent successfully!");
    console.log("Message SID:", message.sid);
    console.log("OTP:", otp);
  } catch (error) {
    console.error("❌ Failed to send SMS:", error);
  }
})();
