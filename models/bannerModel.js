import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  name: String,
  photoUrl: String,
});

const bannerModel = mongoose.model("Banners",bannerSchema);
export default bannerModel;