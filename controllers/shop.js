// @ts-nocheck
// @collapse

const path = require("path");
const fs = require("fs");
const PDFDoc = require("pdfkit");

const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 1;

exports.getIndexPage = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "My Shop",
        path: "/",
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

exports.getProductsPage = (req, res, next) => {
  //     console.log(adminData.products);
  //   res.sendFile(path.join(rootDir, 'views', 'shop.html'))
  //   const products = adminData.products; // Inject it to our template. We pass a second arg to the render method

  // We now pass a function where we know that we do get a products (anything really)
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .lean()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      // console.log(products);

      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
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

exports.getProduct = (req, res, next) => {
  // This is where we get access to the productId from the url
  const prodId = req.params.productId; // Express allows us to access this dynamic data (params) that we added the route

  Product.findById(prodId)
    .then((product) => {
      console.log(product, "fetch product from db");
      // const productDetail = product[0];
      res.render("shop/product-detail", {
        prod: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId);

  Product.findById(prodId)
    .then((product) => {
      console.log(product, "FROM ADD TO CART");
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result, "THE RESULT OF ADD TO CART");
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
  // let fetchedCart;
  // let newQuantity = 1;
  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     fetchedCart = cart;
  //     return cart
  //       .getProducts({ where: { id: prodId } })
  //       .then((products) => {
  //         console.log(products, "IDEK WHAT THIS ISSSSSSSSSSSSSSSSS");
  //         let product;
  //         if (products.length > 0) {
  //           console.log(
  //             products[0].cartItem,
  //             "PRINTING THE PARTICULAR PRODUCT IN THE CART"
  //           );
  //           product = products[0];
  //         }
  //         if (product) {
  //           console.log("MADE  IT HERE AT LEAST");
  //           let oldQuantity = product.cartItem.quantity;
  //           newQuantity = oldQuantity + 1;
  //           console.log(
  //             product.cartItem,
  //             "THIS IS THE PRODUCT WE WOULD BE INCREMENTING"
  //           );
  //           console.log(newQuantity);
  //           return product;
  //         }
  //         return Product.findByPk(prodId);
  //       })

  //       .then((product) => {
  //         return fetchedCart.addProduct(product, {
  //           through: { quantity: newQuantity },
  //         });
  //       })
  //       .then(() => {
  //         res.redirect("/cart");
  //       });
  //   })
  //   .catch((err) => console.log(err));
};

exports.getCartPage = (req, res, next) => {
  let cartProducts = [];
  if (req.session.isLoggedIn !== true) {
    res.status(401).send("Not Authorized");
  }
  if (req.session.isLoggedIn === true) {
    req.user
      .populate("cart.items.productId")
      .then((user) => {
        const products = user.cart.items;
        console.log(products);
        return res.render("shop/cart", {
          pageTitle: "Cart",
          path: "/cart",
          products: products,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        err.httpStatusCode = 500;
        return next(error);
      });
  }

  // req.user
  //   .getCart()
  //   .then((user) => {
  //     console.log(user.cart, "THIS IS THE USER CART");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  //   return cart
  //     .getProducts()
  //     .then((products) => {
  //       // console.log(products);
  //     .catch((err) => console.log(err));
  // });
};

exports.postDeleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteFromCart(prodId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user, "FROM ORDER");
      const cart = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: i.productId._doc }; // We tell mongoose to give us all the
        // data which the it holds (as an object) and not just the id stuff
      });
      console.log(cart);
      const order = new Order({
        user: { name: req.user.name, userId: req.user },
        products: cart,
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrdersPage = (req, res, next) => {
  Order.find({ "user.userId": req.user })
    .then((orders) => {
      console.log(orders, "FROM FIND BY THE USER");
      res.render("shop/orders", {
        orders: orders,
        path: "/orders",
        pageTitle: "Orders",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });

  // req.user
  //   .getOrders()
  //   .then((orders) => {
  //     console.log(orders, "FROM FIND BY THE USER");
  //     res.render("shop/orders", {
  //       orders: orders,
  //       path: "/orders",
  //       pageTitle: "Orders",
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

exports.getCheckoutPage = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      console.log(products);
      total = 0;
      products.forEach((item) => {
        total += item.quantity * item.productId.price;
      });

      return stripe.checkout.sessions.create({
        // config session
        payment_method_types: ["card"],
        // Wbich items will be checked out
        line_items: products.map((prod) => {
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: prod.productId.title,
                description: prod.productId.title,
              },
              unit_amount: prod.productId.price * 100,
            },
            quantity: prod.quantity,
            // name: prod.productId.title,
            // description: prod.productId.title,
            // amount: prod.productId.price * 100,
            // currency: "usd",
            // quantity: prod.quantity,
          };
        }),
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
      });
    })
    .then((session) => {
      console.log(session, "STRIPE SESISON CREATED!");
      return res.render("shop/checkout", {
        pageTitle: "Cart",
        path: "/checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccessPage = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user, "FROM ORDER");
      const cart = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: i.productId._doc }; // We tell mongoose to give us all the
        // data which the it holds (as an object) and not just the id stuff
      });
      console.log(cart);
      const order = new Order({
        user: { name: req.user.name, userId: req.user },
        products: cart,
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }

      if (order.user.userId._id.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized."));
      }

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDoc({ font: "Courier" });
      // This is a readable stream, so we need to pipe it to the file we want
      // adn then pipe it to the response (a write stream already)

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "inline; filename=" + invoiceName + ""
      );

      // Streaming into both the invoice file antd the response to the user
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.info.Title = `Invoice`;
      pdfDoc.info.Subject = `${req.user.name}'s Invoice for order: ${orderId}`;

      pdfDoc.fontSize(20).text("Inv oi ce", {
        underline: true,
        align: "center",
      });
      pdfDoc.text("----------------------------");
      pdfDoc.lineTo(100, 160);
      pdfDoc.lineTo(0, 200);
      pdfDoc.moveDown();

      let total = 0;
      order.products.forEach((item, index) => {
        const columns = {
          column1: { x: 75, width: 250 },
          column2: { x: 355, width: 75 },
          column3: { x: 485, width: 75 },
        };

        total += item.product.price * item.quantity;
        pdfDoc.moveDown();
        pdfDoc.text(item.product.title, columns.column1.x, 150 + index * 20, {
          width: columns.column1.width,
        });
        pdfDoc.text(item.quantity, columns.column2.x, 150 + index * 20, {
          width: columns.column2.width,
        });
        pdfDoc.text(
          "$" + item.quantity * item.product.price,
          columns.column3.x,
          150 + index * 20,
          {
            width: columns.column3.width,
          }
        );

        pdfDoc.moveDown(5);
        pdfDoc.text(
          "------------------------------------------------------------"
        );
        pdfDoc.moveDown(5);
        // pdfDoc
        //   .fontSize(12)
        //   .text(
        //     item.product.title +
        //       item.quantity +
        //       item.product.price * item.quantity,
        //     {
        //       // align: "left",
        //       columns: 3,
        //       columnGap: 130,
        //       width: 400,
        //     }
        //   );
      });

      pdfDoc
        .text(`Total: $${total}`, {
          // width: 500,
          align: "left",
          lineBreak: false,
        })
        .fontSize(17);

      return pdfDoc.end();
    })

    // 1. Loading thr==e file to memory and servinvg it to the user
    // f s.readFile(path.join(invoicePath), (err, data) => {
    //   if (err) {
    //     return next(err);
    //   }
    //   res.setHeader("Content-Type", "application/pdf");
    //   res.setHeader(
    //     "Content-Disposition",
    //     "inline; filename=" + invoiceName + ""
    //   );
    //   res.send(data);
    // });

    //2. STreaming
    // const file = fs.createReadStream(invoicePath); // Create a readstream of the file
    // Reads the file step by step in different chunks

    // The response obj is a writable stream. So we can use readable streams to pipe their
    //  output to a writebale stream.
    // This is very usefl for large data as nde doess not need to download all the file,
    // It rather just streams it poco a poco.
    // It stores at most one chunk of data, the buffer gives us access to the chunks, we do not
    // wait for all the chunks to come together and concat them into one obj rather we fwd them to the
    // browser which then does the concatminto the final file
    // file.pipe(res)

    .catch((err) => {
      next(err);
    });
};
