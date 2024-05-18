import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`);
        console.log("Connected to DB ");
    } catch (error) {
        console.log(" Error while connecting to DB:" + error.message);
    }
}
export default connectDB;
