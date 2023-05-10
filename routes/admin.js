const path = require("path");

const rootDir = require("../utils/path");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

// console.log(rootDir);
// 1. Sometimes these paths may have a common starting path
// router.get("/admin/add-products", (req, res, next) => {
// admin/add-product
router.get("/add-product", isAuth, adminController.getAddProductPage);

router.post(
  "/add-product",
  [
    body("title", "Invalid entry in Title.")
      .isString()
      .isLength({ min: 5 })
      .trim(),

    body("price", "Invalid entry in Price.").isFloat(),

    body("description", "Invalid entry in Description.")
      .isLength({
        min: 5,
        max: 255,
      })
      .trim(),
  ],
  isAuth,
  adminController.postAddNewProduct
); // Parsed L-R

router.get("/products", isAuth, adminController.getProductsPage);

// We can use app.get / app.post to filter the kinds of requests that come in to this route
// router.post("/admin/products",  (req, res, next) => {

// // load the edt product page with the dynamic url
router.post(
  "/edit-product/:productId",
  isAuth,
  adminController.getEditProductPage
);

router.post(
  "/edit-product",
  [
    body("title", "Invalid entry in Title.")
      .isString()
      .isLength({ min: 5 })
      .trim(),

    body("price", "Invalid entry in Price.").isFloat(),

    body("description", "Invalid entry in Description.")
      .isLength({
        min: 5,
        max: 255,
      })
      .trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

// router.post("/delete-product", isAuth, adminController.postDeleteProduct);
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
