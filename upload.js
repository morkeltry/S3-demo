
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const getEnvs = require('env2');

// when we run the function from require('env2'),
// it doesn't just return the .env variables,
// it ALSO sets them in process.env (if they are unset).
const env = getEnvs('.env');
const bucketName = 'app-that-makes-ya-go-aw';
var filePath = "./assets/aw.jpg";

console.log(`Using key: ${process.env.ACCESS_KEY_ID}`);
console.log(`Using bucket: ${bucketName}`);

//configure the AWS environment
AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.ACCESS_KEY_PASSWORD
  });

var s3 = new AWS.S3();

// configure the parameters for this bucket
var params = {
  Bucket: bucketName,
  Body : fs.createReadStream(filePath),
  Key : "folder/"+Date.now()+"_"+path.basename(filePath)
};

s3.upload(params, function (err, data) {
  //handle error
  if (err) {
    console.log("Error", err);
  }

  //success
  if (data) {
    console.log("Uploaded in:", data.Location);
  }
});
