import mongoose from "mongoose";

const connectToMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("Error in connecting to MongoDB:", error.message);
        process.exit(1);
    }
}

export default connectToMongoDB;