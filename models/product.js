const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imageKey: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required : true
  },
});

module.exports = mongoose.model("Product", productSchema);

// const mongodb = require("mongodb");
// const mongo = require("../utils/database");

// mongo;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = +price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     // Add a userId (kind of static of all properties), to reference the user that creted the product
//     this.userId = userId
//   }

//   save() {
//     const db = mongo.getDb();
//     let dbOp;
//     if (this._id) {
//       // Update the existing product
//       dbOp = db
//         .collection("products")
//         .updateOne({ _id: this._id }, { $set: this }); // (condition, what to set)| {this.title : title...}
//     } else {
//       // Create a new product
//       dbOp = db.collection("products").insertOne(this);
//     }
//     return dbOp
//       .then((result) => {
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = mongo.getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         // console.log(products);
//         return products;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findById(prodId) {
//     const db = mongo.getDb();
//     return db
//       .collection("products")
//       .findOne({ _id: new mongodb.ObjectId(prodId) })
//       .then((product) => {
//         return product;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static deleteById(prodId) {
//     const db = mongo.getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then((product) => {
//         return db.collection;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }

// module.exports = Product;
