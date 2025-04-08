import clientPromise from "./mongodb";

export async function getCollection(name: string) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  return db.collection(name);
}

export async function findOne(collection: string, query: any) {
  const col = await getCollection(collection);
  return col.findOne(query);
}

export async function find(collection: string, query: any) {
  const col = await getCollection(collection);
  return col.find(query).toArray();
}

export async function insertOne(collection: string, doc: any) {
  const col = await getCollection(collection);
  return col.insertOne(doc);
}

export async function insertMany(collection: string, docs: any[]) {
  const col = await getCollection(collection);
  return col.insertMany(docs);
}

export async function updateOne(collection: string, query: any, update: any) {
  const col = await getCollection(collection);
  return col.updateOne(query, update);
}

export async function deleteOne(collection: string, query: any) {
  const col = await getCollection(collection);
  return col.deleteOne(query);
}

export async function deleteMany(collection: string, query: any) {
  const col = await getCollection(collection);
  return col.deleteMany(query);
}
