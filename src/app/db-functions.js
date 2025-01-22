
import clientPromise from "../lib/mongodb.js";
import { MongoClient } from 'mongodb';

// Your MongoDB connection URI (ensure it is stored securely in an environment variable)
const uri = process.env.MONGODB_URI; 

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

//Async function that connects to MongoDB
async function connectToDB(dbName) {
  const uri = process.env.MONGODB_URI; 
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB!');
    const db = client.db(dbName);
    return db
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
}
//Async function that connects to desired collection
async function connectToCollection(db, collectionName) {
  const collection = db.collection(collectionName);
  return collection;
  
}
//Async function that finds all documents in a collection
async function findDocuments(collection) {
  const documents = await collection.find().toArray();
  return documents;
}

const fdb = await connectToDB('blog');
const fcollection = await connectToCollection(fdb, 'posts');
const fdocuments = await findDocuments(fcollection);
console.log(fdocuments);
// Call the function to connect
//connectToMongo();

