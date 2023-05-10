const path = require("path");

const express = require("express");

// const rootDir = require('../utils/path')
// const adminData = require("./admin")

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", shopController.getIndexPage);

router.get("/products", shopController.getProductsPage);

router.get("/products/:productId", shopController.getProduct); // for dynamic content, we tell express that we are expecting some
// // to look for products/**** and  not /products/:productId. ORDERING THE ROUTES MATTERS. SPECIFIC ROUTES SHOULD COME FIRST.

router.get("/cart", isAuth, shopController.getCartPage);

router.post("/cart", isAuth, shopController.postCart);

router.get("/orders", isAuth, shopController.getOrdersPage);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.get("/checkout", isAuth, shopController.getCheckoutPage);

router.get("/checkout/success", shopController.getCheckoutSuccessPage);

router.get("/checkout/cancel", shopController.getCheckoutPage);

router.post("/cart/delete-item", isAuth, shopController.postDeleteCartItem);

// router.post("/create-order", isAuth, shopController.postOrder);

module.exports = router;
