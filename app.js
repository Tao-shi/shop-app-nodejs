// @ts-nocheck
require("dotenv").config();
console.log(require("dotenv").config());
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const https = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const { doubleCsrf } = require("csrf-csrf");
const flash = require("connect-flash");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
// const Recaptcha = require("express-recaptcha").RecaptchaV3;

// const rootDir = require('./utils/path')
const errorController = require("./controllers/page-error");
const db = require("./utils/database");

const User = require("./models/user");
const adminRoutes = require("./routes/admin"); // Now a valid middleware function
const shopRoutes = require("./routes/shop"); // Now a valid middleware function
const authRoutes = require("./routes/auth"); // Now a valid middleware function
const uploadImage = require("./utils/upload-image");

// Create an epxress app and store it in a variable
const app = express();

const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

var Recaptcha = require("express-recaptcha").RecaptchaV2;

var recaptcha = new Recaptcha(
  process.env.RECAPTCHA_SITE_KEY,
  process.env.RECAPTCHA_SECRET_KEY
);

// Intitalize the csurf package
const csrfProtection = csrf();

// To use the the connect mongodb session
const store = new MongoDBStore(
  {
    uri: process.env.ATLAS_URI,
    collection: "session",
    connectionOptions: {
      useNewUrlParser: true,
      connectTimeoutMS: 10000,
      useUnifiedTopology: true,
    },
    // expiresAfterSeconds: 10,
  },
  (err) => {
    console.error("LITTLE ERROR FROM store");
  }
);

// Catch errors (same)
// store.on("error", (err) => {
//   console.log(err, "FROM ERR HERE");
// });

// (3. )EJS
// Out of the box too like pug
app.set("view engine", "ejs");
app.set("views", "views");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.logs"),
  { flags: "a" }
);

// Using helmet, morgan(logs) and commpression middleware
// app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

// Parser middleware to parse the response body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json())

// Parser middleware to parse files with
app.use(uploadImage);

// Use cookie-parser
app.use(cookieParser());

// Session middleware
app.use(
  session({
    secret: "secret1",
    resave: false,
    saveUninitialized: false,
    store: store,
    // cookie: { maxAge: 15000 },
  })
);

// Double CSRF middleware
// app.use(csrfProtection.doubleCsrfProtection);

// CSRF uses the session, so we add the middleware after the session middleware
app.use(csrfProtection);
app.use(flash());

// Serve a folder statically and not by express (css, js, images, svgs)
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// Add the csrf value to all routes
app.use((req, res, next) => {
  // These are set local vars that are passed into the views
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// We register a middleware that returns the user so we can use it in our app
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id) // We now tell mongoose to use the data from the
    // session which is only active when the user is logged-in. Instead of passing an 'global' Id
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user; // Gives it access to the defined methods
      // A bit repetitive though
      next();
    })
    .catch((err) => {
      throw new Error(err);
      next();
    });
});

// 2. We can now add it here as a filter
// app.use("/g", recaptcha.middleware.render, function (req, res, next) {
//   console.log(res)
//   res.send('hi there');
// });
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.getError505page);

// Catch-all middleware that handles all the unknown routes
app.use(errorController.getErrorPage);

// Central error handler by express
app.use((error, req, res, next) => {
  // We now define what we want to happen
  console.log(error);
  res.redirect("/500");
});

// This gives us a running server. But doesn't handle any req, cause there is no logic
// const server = http.createServer(app);

db.then(() => {
  https;
  // .createServer({ key: privateKey, cert: certificate }, app)
  // .listen(process.env.PORT || 3000);
  app.listen(process.env.PORT || 3000);
  console.log("APP STARTED");
}).catch((err) => {
  console.log(err);
});
