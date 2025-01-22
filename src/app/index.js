
import clientPromise from "../lib/mongodb.js";
import { MongoClient } from 'mongodb';

// Your MongoDB connection URI (ensure it is stored securely in an environment variable)
const uri = process.env.MONGODB_URI; // It's important to use .env to store sensitive info

const client = new MongoClient(uri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB!');
    const db = client.db('blog');
    const collection = db.collection('posts');
    const first = await collection.findOne();
    first ? console.log(first) : console.log('No document found');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
}

// Call the function to connect
connectToMongo();

