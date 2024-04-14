import mongoose from "mongoose";

const connectDB = async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("succecc mongoDB");
    } catch (err) {
      console.log("Failure:Unconnected to MongoDB");
      throw new Error();
    }
  }
};

export default connectDB;
