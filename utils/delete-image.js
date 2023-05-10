//@ts-nocheck

const path = require("path");

const AWS_S3 = require("./aws-config").s3;

module.exports = function (imageKey) {
  AWS_S3.deleteObject(
    { Bucket: "node-shop-app", Key: imageKey },
    (err, data) => {
      if (err) {
        console.log(err);
        throw err;
      }
      console.log(data, "DELETED OBJECT FROM BUCKET");
    }
  );
};
