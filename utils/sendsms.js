// utils/sendSms.js
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send SMS
 * @param {string} to - Recipient's phone number in E.164 format (+countrycode)
 * @param {string} body - SMS message text
 */
export async function sendSms(to, body) {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
      to,
    });

    console.log("SMS sent:", message.sid);
    return { success: true };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return { success: false, error };
  }
}
