import { s3 } from "../../db-configs/awsSDK";

const albumBucketName: any = process.env.EXPO_PUBLIC_BUCKET_NAME;
// List the photo albums that exist in the bucket.

export const getPictures = async () => {
    s3.listObjectsV2({ Bucket: albumBucketName }, function (err, data) {
        if (err) {
        return alert("There was an error listing : " + err.message);
        } else {
        console.log(data.Contents);
        }
    });
}

  