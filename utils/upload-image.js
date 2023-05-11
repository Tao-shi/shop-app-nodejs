//@ts-nocheck
const path = require("path");
const crypto = require("crypto")

const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY,
  region: "us-east-1",
});

// const fileStorage = multer.diskStorage({
// //     destination: (req, file, cb) => {
// //       cb(null, "images");
// //     },
// //     filename: (req, file, cb) => {
// //       cb(null, new Date().toISOString() + "-" + file.originalname);
// //     },
// //   });

const fileSanitizer = (req, file, cb) => {
  console.log(file);
  console.log(file.originalname, "EXISTSSSSSSS?");
  const fileExts = [".png", ".jpg", ".jpeg"];

  let isAllowedExt;
  try {
    isAllowedExt = fileExts.includes(
      path.extname(file.originalname.toLowerCase())
    );
  } catch (error) {
    throw new Error(error.message);
  }

  console.log(isAllowedExt);

  const isAllowedMimeType = file.mimetype.startsWith("image/");

  if (isAllowedExt && isAllowedMimeType) {
    console.log("OR HEER");
    return cb(null, true);
  } else {
    console.log("HERE DEF");
    new Error("File type not allowed!");
    return cb(false);
  }
};

const s3Storage = multerS3({
  s3: s3,
  bucket: "node-shop-app",
  acl: "public-read",
  metadata: (req, file, cb) => {
    cb(null, {
      fieldname: file.fieldname,
      hash: crypto.createHash("md5").update(file.originalname).digest('hex'),
    });
  },
  key: (req, file, cb) => {
    const fileName =
      Date.now() + "_" + file.fieldname + "_" + file.originalname;
    cb(null, fileName);
  },
});

module.exports = multer({
  storage: s3Storage,
  fileFilter: fileSanitizer,
  limits: {
    fileSize: 1024 * 1024 * 2, // 2mb file size
  },
}).single("image");
