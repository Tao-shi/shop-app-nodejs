const express = require("express");
const { check, body } = require("express-validator");

const router = express.Router();

const authController = require("../controllers/auth");
const User = require("../models/user");
const isHuman = require("../middleware/is-human");
const Recaptcha = require("express-recaptcha").RecaptchaV2;

const recaptcha = new Recaptcha(
  process.env.RECAPTCHA_SITE_KEY,
  process.env.RECAPTCHA_SECRET_KEY
);

router.get("/login", authController.login);

router.post(
  "/login",
  [
    body("email", "Please enter a valid email.").isEmail().normalizeEmail(),

    body("password", "Password must be at least 5 characters long.")
      .isAlphanumeric()
      .trim(),
  ],
  recaptcha.middleware.verify,
  authController.postLogin
);

router.get("/signup", recaptcha.middleware.render, authController.signup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("This email is forbidden!");
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("E-mail already exists!.");
          }
        });
      })
      .normalizeEmail(),

    body("password", "Password must be at least 5 characters long.")
      .isLength({
        min: 5,
      })
      .isAlphanumeric()
      .trim(),

    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match! Please retry.");
        }
        return true;
      })
      .trim(),
  ],

  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post(
  "/reset",

  body("email").isEmail().withMessage("Please enter a valid email."),

  authController.postReset
);

router.get("/reset/:token", authController.resetPassword);

router.post(
  "/reset-password",
  [
    body("newPassword", "Password must be at least 5 characters long.")
      .isLength({
        min: 5,
      })
      .isAlphanumeric()
      .trim(),

    body("confirmNewPassword")
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Passwords do not match! Please retry.");
        }
        return true;
      })
      .trim(),
  ],
  authController.postResetPassword
);

module.exports = router;
