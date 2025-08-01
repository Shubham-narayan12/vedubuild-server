import mongoose from "mongoose";

const ATLASDB_URL = "mongodb+srv://narayandivya00:0OABJiPpNNJp6OJp@cluster0.0wpjdpm.mongodb.net/VeduBuild"
const connectDb = async () => {
  try {
    await mongoose.connect(ATLASDB_URL);
    console.log("connected to Db");
  } catch (error) {
    console.log(`mongoDb Error ${error}`);
  }
};

export default connectDb;

