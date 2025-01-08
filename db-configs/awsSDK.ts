import AWS from "aws-sdk";

const albumBucketName = process.env.EXPO_PUBLIC_BUCKET_NAME;
const bucketRegion = process.env.EXPO_PUBLIC_BUCKET_REGION;
const IdentityPoolId:any = process.env.EXPO_PUBLIC_IDENTITY_POOL_ID;

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
  }),
});

let s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName },
});

export { s3 };