import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Students", // jis student ko assign hua ho
    default: null,
  },
});

const offerSchema = new mongoose.Schema(
  {
    offer_Name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    payout: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // 🔥 NEW: Image field added (will store only URL)
    offerImage: {
      type: String,
      required: false, // optional, user chahe to add kare
      default: null,
    },
    couponCodes: [couponSchema], // multiple coupon codes ek hi offer me
  },
  {
    timestamps: true, // createdAt, updatedAt auto add hote hain
  }
);

const OfferModel = mongoose.model("Offers", offerSchema);

export default OfferModel;
