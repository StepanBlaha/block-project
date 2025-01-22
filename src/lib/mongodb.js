import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log("MONGODB_URI:", process.env.MONGODB_URI);
let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
