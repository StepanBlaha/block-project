
import clientPromise from "../lib/mongodb.js";
import { MongoClient } from 'mongodb';

// Your MongoDB connection URI (ensure it is stored securely in an environment variable)
const uri = process.env.MONGODB_URI; 

const client = new MongoClient(uri);

export async function connectToMongo() {
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
export async function connectToDB(dbName) {
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
export async function connectToCollection(db, collectionName) {
  const collection = db.collection(collectionName);
  return collection;
  
}
const removeCircularRef = (obj) => {
  const seen = new WeakSet();
  return JSON.parse(
      JSON.stringify(obj, (key, value) => {
          if (typeof value === "object" && value !== null) {
              if (seen.has(value)) return;
              seen.add(value);
          }
          return value;
      })
  );
};
//Async function that finds all documents in a collection
export async function findDocuments(collection) {
  const documents = await collection.find().toArray();
  if (documents.length == 0) {
    return "Collection is empty"
  }
  return await documents;
}
export async function insertDocuments(database, collectionToInsert, jsonObject){
  try {
    const collection = database.collection(collectionToInsert)
    const cleanObject = removeCircularRef(jsonObject)
    const result = await collection.insertOne(cleanObject)
    return await result

  } catch (error) {
    console.log(error)
    throw error
  }
}

const fdb = await connectToDB('blog');
const fcollection = await connectToCollection(fdb, 'posts');
const fdocuments = await findDocuments(fcollection);
console.log("Found documents: ",fdocuments)
const insert = await insertDocuments(fdb, "posts", {
  name: "Company Inc",
  address: "Highway 37",
});
console.log("Insert Result:", insert);

const block_db = await connectToDB('block-project');
const block_collection = await connectToCollection(block_db, 'canvas-files');
const block_documents = await findDocuments(block_collection);

console.log(block_documents);
// Call the function to connect
//connectToMongo();

