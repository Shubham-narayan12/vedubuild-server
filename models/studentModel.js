import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

const studentSchema = new mongoose.Schema({
  aplication_id: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  mobileNo: {
    type: Number,
    required: true,
  },
  emailId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  pinCode: {
    type: Number,
    required: true,
  },
  schoolCollege: {
    type: String,
    required: true,
  },
  boardName: { type: String, required: true },
  aadharNo: {
    type: String,
    required: true,
    unique: [true, "aadhar already in used"],
  },
  scholarship: {
    type: String,
    required: true,
  },
  studentClass: {
    type: String,
    //required: true,
  },
  combination: {
    type: String,
    default: "N/A",
  },
  profileImage: {
    type: Buffer, // 👈 Binary data
    contentType: String, // 👈 mime type (jpg/png)
  },
  paymentStatus: { type: String, default: "Pending" },
  credentialsSentAt: {
    type: Date,
    default: null,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpire: {
    type: Date,
    default: null,
  },
  offersRedeemed: [
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offers",
    },
    couponCode: String, // jis code ko use kiya
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
  },
],
  canDownloadCertificate: {
    type: Boolean,
    default: false,
  },
});

//HASH FUNCTION FOR PASSWORD ENCRYPT
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

//COMPARE FUNCTION FOR PASSWORD WHILE LOGIN(PASSWORD DECRYPT)
studentSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//JWT TOKEN
studentSchema.methods.generateToken = function () {
  return JWT.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const studentModel = mongoose.model("Students", studentSchema);
export default studentModel;
