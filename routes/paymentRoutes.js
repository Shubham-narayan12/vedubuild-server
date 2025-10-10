import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import paymentModel from "../models/paymentModel.js";
import studentModel from "../models/studentModel.js";

const router = express.Router();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ====================================================== ✅ CREATE ORDER===========================================================
router.post("/order", async (req, res) => {
  try {
    const { amount, studentId } = req.body;

    if (!amount || !studentId) {
      return res
        .status(400)
        .json({ message: "Amount and studentId are required" });
    }

    const options = {
      amount: amount * 100, // paise me
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // save in DB with status = pending
    const payment = await paymentModel.create({
      studentId,
      orderId: order.id,
      amount,
      currency: order.currency,
      status: "pending",
    });

    res.json({ order, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order creation failed" });
  }
});

// =====================================================✅ VERIFY PAYMENT ==========================================================
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // basic validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment data" });
    }

    // generate expected signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // ✅ update payment as success
      const updatedPayment = await paymentModel.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          status: "success",
        },
        { new: true } // return updated doc
      );

      // ✅ Update student's paymentStatus = "Success"
      if (updatedPayment?.studentId) {
        await studentModel.findByIdAndUpdate(updatedPayment.studentId, {
          paymentStatus: "Success",
        });
      }

      return res.json({
        success: true,
        message: "Payment verified successfully",
        payment: updatedPayment,
      });
    } else {
      // update payment as failed
      const failedPayment = await paymentModel.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed" },
        { new: true }
      );

      return res.json({
        success: false,
        message: "Payment verification failed",
        payment: failedPayment,
      });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});

export default router;
