const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const Product = require("./product");

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    resetToken: { type: String },
    resetTokenExpiration: { type: Date },
    cart: {
      items: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true },
        },
      ],
    },
    favorites:{type: Array}
  },
  { timestamps: true }

  // We can also create instance mehtods like this
  // {
  //   methods: {
  //     clearCart(cb) {
  //       this.cart = { items: [] };
  //       cb(this.save());
  //     },
  //   },
  // }
);

userSchema.methods.addToCart = function (product) {
  const cartProductsIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  let updatedCartItems = [...this.cart.items];
  if (cartProductsIndex >= 0) {
    newQuantity = this.cart.items[cartProductsIndex].quantity + 1;
    updatedCartItems[cartProductsIndex].quantity = newQuantity;
  }
  // product.quantity = 1; // Adds a quantity
  else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.getCart = function () {
  // This returns the full product details that are in the cart currently
  Product.find().then((products) => {
    const allProducts = [...products];
    const userCartItems = [...this.cart.items];
    const newUserCartItems = userCartItems.filter((items) => {
      return allProducts.some((items2) => {
        return items.productId.toString() === items2._id.toString();
      });
    });
    console.log(newUserCartItems, "THE NEW CART ITEMS AFTER PRODUCT DELETION");
    return this.save().then(() => {
      const prodIds = this.cart.items.map((p) => p.productId);
      Product.find({ _id: { $in: prodIds } }).then((products) => {
        console.log(
          products,
          "FULL PRODUCT DETAILS THAT ARE IN THE CART CURRENTLY"
        );
        return products.map((p) => {
          console.log("made it here?");
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      });
    });
  });
};

userSchema.methods.deleteFromCart = function (productId) {
  console.log(productId);

  const updatedCartItems = this.cart.items.filter((i) => {
    return i.productId.toString() !== productId.toString();
  });
  console.log(updatedCartItems);
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
// const mongodb = require("mongodb");
// const mongo = require("../utils/database");

// class User {
//   constructor(username, email, cart, id) {
//     this.username = username;
//     this.email = email;
//     this.cart = cart; // {iten:[]}
//     this.createdAt = new Date();
//     this._id = id;
//   }

//   save() {
//     const db = mongo.getDb();
//     return db
//       .collection("users")
//       .insertOne(this)
//       .then((result) => {})
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   getCart() {
//     // This returns the full product details that are in the cart currently
//     const db = mongo.getDb();
//     return db.collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         const allProducts = [...products];
//         const userCartItems = [...this.cart.items];

//         const newUserCartItems = userCartItems.filter((items) => {
//           return allProducts.some((items2) => {
//             return items.productId.toString() === items2._id.toString();
//           });
//         });
//         console.log(
//           newUserCartItems,
//           "THE NEW CART ITEMS AFTER PRODUCT DELETION"
//         );
//         return db
//           .collection("users")
//           .updateOne(
//             { _id: new mongodb.ObjectId(this._id) },
//             { $set: { 'cart.items': newUserCartItems } }
//         ).then(() => {
//            const prodIds = this.cart.items.map((p) => p.productId);
//            return db
//              .collection("products")
//              .find({ _id: { $in: prodIds } })
//              .toArray()
//              .then((products) => {
//                console.log(
//                  products,
//                  "FULL PRODUCT DETAILS THAT ARE IN THE CART CURRENTLY"
//                );
//                return products.map((p) => {
//                  return {
//                    ...p,
//                    quantity: this.cart.items.find((i) => {
//                      return i.productId.toString() === p._id.toString();
//                    }).quantity,
//                  };
//                });
//              });
//         })

//       });

//   }

//   addToCart(product) {
//     const db = mongo.getDb();
//     const cartProductsIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     let updatedCartItems = [...this.cart.items];
//     if (cartProductsIndex >= 0) {
//       newQuantity = this.cart.items[cartProductsIndex].quantity + 1;
//       updatedCartItems[cartProductsIndex].quantity = newQuantity;
//     }
//     // product.quantity = 1; // Adds a quantity
//     else {
//       updatedCartItems.push({
//         productId: new mongodb.ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }
//     const updatedCart = { items: updatedCartItems };
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   deleteFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter((i) => {
//       return i.productId.toString() !== productId.toString();
//     });
//     const db = mongo.getDb();
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: { items: updatedCartItems } } }
//       );
//   }

//   addOrder() {
//     // CReate as a new collection OR as an embedded document
//     const db = mongo.getDb();
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             _id: new mongodb.ObjectId(this._id),
//             name: this.username,
//             email: this.email,
//           },
//         };
//         return db.collection("orders").insertOne(order, {
//           writeConcern: { w: 1, j: true, wtimeout: 3000 },
//         });
//       })
//       .then((result) => {
//         this.cart.items = [];
//         return db
//           .collection("users")
//           .updateOne(
//             { _id: new mongodb.ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }

//   getOrders() {
//     const db = mongo.getDb();
//     return db
//       .collection("orders")
//       .find({ "user._id": new mongodb.ObjectId(this._id) }) // Searching through embedded documents
//       .toArray();
//   }

//   static findById(userId) {
//     const db = mongo.getDb();
//     return db
//       .collection("users")
//       .findOne({ _id: new mongodb.ObjectId(userId) })
//       .then((user) => {
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findByEmail(email) {
//     const db = mongo.getDb();
//     return db
//       .collection("users")
//       .find({ email: email })
//       .next()
//       .then((user) => {
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }

// module.exports = User;
