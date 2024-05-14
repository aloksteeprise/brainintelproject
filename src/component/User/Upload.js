import React, { useState } from 'react';
import AWS from 'aws-sdk';

// var albumBucketName = "brainintelcorp";
// var bucketRegion = "us-east-1";
// var IdentityPoolId = "us-east-1:e2ae7738-2b59-4830-884c-ed0565282451";

// var albumBucketName = 'testing-react-app-bic';
// var bucketRegion = 'ap-south-1';
// var IdentityPoolId = ' ap-south-1:51ca1785-dd61-4db1-8958-7463e1b16b5f';
var albumBucketName = 'wav-directory';
var bucketRegion = 'us-east-1';
var IdentityPoolId = 'us-east-1:3800b6bb-b0af-4093-bd6c-d136afcf3fbb';

console.log('I AM HERE PLEASE EHLP');
AWS.config.region = bucketRegion; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: IdentityPoolId,
});

var s3 = new AWS.S3({
  apiVersion: '2012-10-17',
  params: { Bucket: albumBucketName },
});

const UploadImageToS3WithNativeSdk = () => {
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileInput = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadFile = (file) => {
    var params = { Body: file, Bucket: albumBucketName, Key: file.name };
    s3.putObject(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log('sucess');
      }
    }); // an error occurred else console.log(data); // successful response /* data = { ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", VersionId: "tpf3zF08nBplQK1XLOefGskR7mGDwcDk" } */ });
  };

  return (
    <div>
      <div>Native SDK File Upload Progress is {progress}%</div>
      <input type="file" onChange={handleFileInput} />
      <button onClick={() => uploadFile(selectedFile)}> Upload to S3</button>
    </div>
  );
};

export default UploadImageToS3WithNativeSdk;
