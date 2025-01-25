import { connectToDatabase } from './../db-functions';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const data = await db.collection('canvas-files').find({}).toArray();
  res.status(200).json(data);
}
export const data = ['steve','jim','julie'];
