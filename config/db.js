import mongoose from "mongoose";

//const ATLASDB_URL 
const connectDb = async () => {
  try {
    await mongoose.connect(ATLASDB_URL);
    console.log("connected to Db");
  } catch (error) {
    console.log(`mongoDb Error ${error}`);
  }
};

export default connectDb;

