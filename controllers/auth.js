// @ts-nocheck
// @collapse

const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const cookie = require("cookie");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user");
const AWS_SES = require("../utils/aws-config").ses;

const Recaptcha = require("express-recaptcha").RecaptchaV2;

const recaptcha = new Recaptcha(
  process.env.RECAPTCHA_SITE_KEY,
  process.env.RECAPTCHA_SECRET_KEY
);

// Init the transporter : Setup telling node how it should set up
// This is for Sendgrid
// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       api_user: api_,
//     },
//   })
// );

const sendEmail = function (recipientEmail, name) {
  const params = {
    Source: "taofiq.subair@gmail.com",
    Destination: {
      ToAddresses: [`${recipientEmail}`],
    },
    ReplyToAddresses: ["taofiq.subair@gmail.com"],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
          <h2 style="color: green">Welcome, ${name} 🎉</h2>
          <p>We want to welcome you to our service. We hope you enjoy using our service.</p>
          `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Welcome`,
      },
    },
  };
  return AWS_SES.sendEmail(params).promise();
};

const sendResetEmail = function (recipientEmail, name, token) {
  const params = {
    Source: "taofiq.subair@gmail.com",
    Destination: {
      ToAddresses: [`${recipientEmail}`],
    },
    ReplyToAddresses: ["taofiq.subair@gmail.com"],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
          <p>Dear ${name}, a request to reset your password was sent. If you did not request this, please ignore.</p>
          <p>To reset your password, plsease click this <a href="http://localhost:3000/reset/${token}">link</a>.</p>
          `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Password Reset`,
      },
    },
  };
  return AWS_SES.sendEmail(params).promise();
};

const sendResetEmailSuccess = function (recipientEmail, name) {
  const params = {
    Source: "taofiq.subair@gmail.com",
    Destination: {
      ToAddresses: [`${recipientEmail}`],
    },
    ReplyToAddresses: ["taofiq.subair@gmail.com"],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
          <p>Dear ${name}, you have successfully changed your password. If you did not initate this change, please contact support.</p>
          `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Password Reset`,
      },
    },
  };
  return AWS_SES.sendEmail(params).promise();
};

// const transporter = nodemailer.createTransport({
//   SES: { AWS_SES },
// });

exports.login = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1].trim(); // Accessing the cookie from the browser, to use to send a request with.
  // req.session.isLoggedIn = true
  let message = req.flash("error");
  let message2 = req.flash("success");

  message = message && message.length > 0 ? message[0] : null;
  message2 = message2 && message2.length > 0 ? message2[0] : null;

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
    successMessage: message2,
    oldInput: { email: "", password: "" },
    validationError: [],
  });
};

exports.postLogin = (req, res, next) => {
  //   req.isLoggedIn = true; // This is lost after the request is sent and a response is received. It does not stick around!
  // That is why we need cookies

  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  console.log(errors.array());
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      successMessage: null,
      oldInput: { email: email, password: password },
      validationError: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        console.log("No user with this email address exists!");
        // req.flash("error", "Invalid email or password.");
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Invalid email or password!",
          successMessage: null,
          oldInput: { email: email, password: password },
          validationError: [],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((result) => {
          if (result) {
            console.log("Password correct! and email exists");
            req.session.user = user; // Gives it access to the defined methods
            req.session.isLoggedIn = true;

            return req.session.save((err) => {
              console.log(err);
              res.redirect("/"); // Guarantees that mongodb has been written to before
              //   sending a redirection response.
            });
          }
          console.log("password not correct but email exists");
          req.flash("error", "Invalid email or password!");
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            path: "/login",
            errorMessage: "Invalid email or password!",
            successMessage: null,
            oldInput: { email: email, password: password },
            validationError: [],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};

exports.signup = (req, res, next) => {
 const captcha = res.recaptcha
  // console.log(res.captcha)
  let message = req.flash("error");
  let message2 = req.flash("success");

  message = message && message.length > 0 ? message[0] : null;
  message2 = message2 && message2.length > 0 ? message2[0] : null;
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    errorMessage: message,
    successMessage: message2,
    oldInput: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationError: [],
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY
  });

  // res.render("auth/signup", {
  //   pageTitle: "Signup",
  //   path: "/signup",
  //   errorMessage: message,
  //   successMessage: message2,
  //   oldInput: {
  //     name: "",
  //     email: "",
  //     password: "",
  //     confirmPassword: "",
  //     recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
  //     // captcha: res.captcha
  //   },
  //   validationError: [],
  // });
};

exports.postSignup = (req, res, next) => {
  console.log(req)
  console.log(req.body['g-recaptcha-response'])

  console.log(req.recaptcha);
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      successMessage: null,
      oldInput: {
        name: req.body.name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationError: errors.array(),
    });
  }
  
  console.log(email, password, confirmPassword);
  if(!req.body['g-recaptcha-response']){
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      errorMessage: "We could not verify you are not a robot. Please try the CAPTCHA again.",
      successMessage: null,
      oldInput: {
        name: req.body.name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationError: errors.array(),
    });
    
}
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      return User.create({
        name: name,
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
    })
    .then(() => {
      console.log("User created!");
      req.flash("success", "Account successfully created! Please Login.");
      res.redirect("/login");
      return sendEmail(email, name);
    })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
  // }
};

exports.postLogout = (req, res, next) => {
  // Clear session
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  let message2 = req.flash("success");

  message = message && message.length > 0 ? message[0] : null;
  message2 = message2 && message2.length > 0 ? message2[0] : null;

  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: message,
    successMessage: message2,
    oldInput: {
      email: "",
    },
    validationError: [],
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  let retrievedUser;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/reset", {
      pageTitle: "Reset",
      path: "/reset",
      errorMessage: errors.array()[0].msg,
      successMessage: null,
      oldInput: {
        email: email,
      },
      validationError: errors.array(),
    });
  }

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return res.status(422).render("auth/reset", {
            pageTitle: "Reset",
            path: "/reset",
            errorMessage: "No account with that email found!",
            successMessage: null,
            oldInput: { email: email },
            validationError: [{ path: "email" }],
          });
        }
        retrievedUser = user;
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 1800000;
        user
          .save()
          .then((result) => {
            req.flash("success", "Password reset link sucessfully sent!");
            res.redirect("/login");
            return sendResetEmail(email, retrievedUser.name, token);
          })
          .then((result) => {})
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        const error = new Error(err);
        err.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.resetPassword = (req, res, next) => {
  let message = req.flash("error");
  let message2 = req.flash("success");

  message = message && message.length > 0 ? message[0] : null;
  message2 = message2 && message2.length > 0 ? message2[0] : null;

  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash("error", "An error occurred.");
        return res.redirect("/login");
      }
      return res.render("auth/reset-password", {
        pageTitle: "Reset Password",
        path: "/reset-password",
        token: token,
        errorMessage: message,
        successMessage: message2,
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      console.log("ENTERED");
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};

exports.postResetPassword = (req, res, next) => {
  const newPassword = req.body.newPassword;
  const confirmNewPassword = req.body.confirmNewPassword;
  const userId = req.body.userId;
  const token = req.body.token;
  const errors = validationResult(req);
  console.log(token);
  console.log(errors.array());

  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect(`/reset/${token}`);
  }

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "An error occurred.");
        return res.redirect("/login");
      }
      retrievedUser = user;
      bcrypt
        .hash(newPassword, 12)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          user.resetToken = undefined;
          user.resetTokenExpiration = undefined;
          return user.save();
        })
        .then((result) => {
          req.flash(
            "success",
            "Password successfully changed! Login with new password."
          );
          res.redirect("/login");
          return sendResetEmailSuccess(retrievedUser.email, retrievedUser.name);
        })
        .then((result) => {})
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log("OR HERE????");
      const error = new Error(err);
      err.httpStatusCode = 500;
      return next(error);
    });
};
