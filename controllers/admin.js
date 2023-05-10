// @ts-nocheck
// @collapse

const cookie = require("cookie");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const Product = require("../models/product");
const deleteImage = require("../utils/delete-image");

const ITEMS_PER_PAGE = 5;

exports.getAddProductPage = (req, res, next) => {
  //   res.render("admin/add-product", { // Since we render almost the same as add new product page
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    successMessage: null,
    validationError: [],
    // isAuthenticated: req.session.isLoggedIn, No longer need since we store it in the res.locals
    // layout: false; //  not use the default handlebar layout
  });
};

exports.postAddNewProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      prod: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Please select an image.",
      successMessage: null,
      validationError: [],
      // isAuthenticated: req.session.isLoggedIn, No longer need since we store it in the res.locals
      // layout: false; //  not use the default handlebar layout
    });
  }

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      prod: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      successMessage: null,
      validationError: errors.array(),
      // isAuthenticated: req.session.isLoggedIn, No longer need since we store it in the res.locals
      // layout: false; //  not use the default handlebar layout
    });
  }
console.log(res.locals.csrfToken, "CSRF TOKEN")
  const imageUrl = image.location;
  const imageKey = image.key;

  console.log(image, "IMAGE");
  const product = new Product({
    // _id: new mongoose.Types.ObjectId("643bfcbab17c9887fb343be9"),
    title: title,
    description: description,
    price: +price * 100,
    imageUrl: imageUrl,
    imageKey: imageKey,
    userId: req.user, // mongoose allows us to just supply the obj, it picks the id
  })
    .save() // from mongoose
    .then(() => {
      console.log("Created Product");
      req.flash("success", "Successfully added new product!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err, "JVWFBWFNEOIFENFOI");
      const error = new Error(err);
      err.httpStatusCode = 500;
      // return next(error); // When we return a next(''error object like thingy''), express auto
      // makes use of the global error handler to handle this error

      // res.redirect("/500");
      ////////
      // res.status(500).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   prod: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description,
      //   },
      //   errorMessage: "Database operation failed, please try again.",
      //   successMessage: null,
      //   validationError: [],
      // });
    });
};

exports.getEditProductPage = (req, res, next) => {
  let message = req.flash("success");

  message = message && message.length ? message[0] : null;

  // Accessing query params through express (url)
  const editMode = req.query.edit;
  if (!editMode) return res.redirect("/");

  //   console.log(productId);
  //   Product.findById(productId, (product) => {
  const productId = req.params.productId; // from the url

  // Product.findByPk(productId)
  // We can look for only products created by the current user:
  Product.findById(productId)
    .then((product) => {
      if (!product) return res.redirect("/");
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        prod: product,
        hasError: false,
        errorMessage: null,
        successMessage: message,
        validationError: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      prod: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      successMessage: null,
      validationError: errors.array(),
      // isAuthenticated: req.session.isLoggedIn, No longer need since we store it in the res.locals
      // layout: false; //  not use the default handlebar layout
    });
  }

  Product.findById(prodId)
    .then((product) => {
      console.log(product);
      console.log(req.user);
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      console.log("I made it into the post edit");
      console.log(product);
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      console.log(res.locals.csrfToken, "CSRF TOKEN")

      return product.save().then(() => {
        console.log("product has been updated");
        req.flash("success", "Successfully updated product!");
        res.redirect("/admin/products");
      });
    })

    // We can also just  create a new product obj from the product
    // const product = new Product(
    //   updatedTitle,
    //   updatedPrice,
    //   updatedDescription,
    //   updatedimageUrl,
    //   prodId
    // );
    // return product
    //   .save()

    //   .then(() => {
    //     console.log("UPDATED PRODUCT");
    //     res.redirect("/admin/products");
    //   })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId, "this is from delete controller");
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return new Error("Product not found.");
      }
      console.log(product.imageKey, "SIGHHHHHHHHHHH");
      deleteImage(product.imageKey);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log("DELETED!");
      console.log(res.locals.csrfToken, "CSRF TOKEN")

      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  console.log(prodId, "this is from delete controller");
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return new Error("Product not found.");
      }
      console.log(product.imageKey, "SIGHHHHHHHHHHH");
      deleteImage(product.imageKey);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log("DELETED!");
      res.status(200).json({ message: "Product Deleted" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Delete Failed" });
    });
};

exports.getProductsPage = (req, res, next) => {
  let message = req.flash("success");
  message = message && message.length ? message[0] : null;

  const page = +req.query.page || 1;
  let totalItems;

  Product.find({ userId: req.user._id })
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find({ userId: req.user._id })
        .lean()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    // Product.findAll()
    // .select('title price -_.id') // select the fields that we want to be returned ('title price, -.id)
    // .populate("userId") // this tells mongoose (dealing with relations) that we just don't want
    // to get the products, we also want the complete related data. Args are path (the field we want, ["userId.nestedAlso"])
    // second argument is the fields it should contain
    .then((products) => {
      // console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        errorMessage: null,
        successMessage: message,
        currentPage: page,
        hasNextPage: totalItems > page * ITEMS_PER_PAGE,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};
