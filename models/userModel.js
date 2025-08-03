import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "required"],
      unique: [true, "emai already register"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password shoudl be greater than 6 character"],
    },
    city: {
      type: String,
      required: [true, "city name is required"],
    },
    state: {
      type: String,
      required: [true, "country is required"],
    },
    phone: {
      type: Number,
      required: [true, "phone is required"],
      unique: [true, "phone number already register"],
    },
  },
  { timestamps: true }
);

//HASH FUNCTION FOR PASSWORD ENCRYPT
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

//COMPARE FUNCTION FOR PASSWORD WHILE LOGIN(PASSWORD DECRYPT)
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//JWT TOKEN
userSchema.methods.generateToken = function () {
  return JWT.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
