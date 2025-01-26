import mongoose from "mongoose";

let isConnected = false; // Database connection status
// Connect to MongoDB
const connect = async () => {
    console.log("Checking connection state...");
    console.log("ReadyState:", mongoose.connection.readyState);

    if (isConnected) {
        console.log("Already connected to MongoDB ss");
        return;
    }

    if (mongoose.connection.readyState === 1) {
        // Connection already open
        console.log("Already connected to MongoDB dd");
        isConnected = true;
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "block-project", // Specify the database name explicitly
          });
        isConnected = true;
        console.log("Successfully connected to MongoDB");
        console.log("Connected to MongoDB skibidaku");
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        throw new Error("Error connecting to MongoDB skibid" +  error.message);
    }
}
export default connect;