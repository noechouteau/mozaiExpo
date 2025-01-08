import { PutObjectRequest } from "aws-sdk/clients/s3";
import { s3 } from "../../db-configs/awsSDK";

const albumBucketName: any = process.env.EXPO_PUBLIC_BUCKET_NAME;
// List the photo albums that exist in the bucket.

export const uploadPicture = async (imageFile: any, key:string) => {
    const params = {
        Bucket: albumBucketName,
        Key: key, // The key name for the uploaded object (e.g., "folder/image.jpg")
        Body: imageFile, // The content of the file
      } satisfies PutObjectRequest;
    
      try {
        const result = await s3.upload(params).promise();
        console.log("Image uploaded successfully:", result);
        return result;
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
}

  