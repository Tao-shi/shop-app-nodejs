require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;

const uri = process.env.ATLAS_URI;
const collectionName = "products";
const propertyToUpdate = "title";
const newValue = "updated from scriptttt";

const updateAllProducts = async () => {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db();
    const collection = db.collection(collectionName);

    const result = await collection.updateMany(
      {},
      { $set: { [propertyToUpdate]: newValue } }
    );
    condolr.log('Updated products!')
  } catch (error) {
    console.log(error)
};

updateAllProducts()