const AWS = require('aws-sdk')

AWS.config.update({
    accessKeyId: "AKIA5M7AEZIFCJG7ZRIX",
    secretAccessKey: "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",
    region: "us-east-1"
})
  
  exports.s3 = new AWS.S3()
  exports.ses = new AWS.SES()