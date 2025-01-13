import { PutObjectRequest } from "aws-sdk/clients/s3";
import { s3 } from "../../db-configs/awsSDK";
import { Asset } from 'expo-asset';
import * as FileSystem from "expo-file-system";

const albumBucketName: any = process.env.EXPO_PUBLIC_BUCKET_NAME;
// List the photo albums that exist in the bucket.

export const uploadPicture = async (imageUri: any, key:string) => {
        
    const blob = await fetch(imageUri).then((response) => response.blob());


    console.log("Blob", blob);
    const params = {
        Bucket: albumBucketName,
        Key: key, // The key name for the uploaded object (e.g., "folder/image.jpg")
        Body: blob, // The content of the file
        ContentType: "image/png", // Ensure the browser knows it's an image
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

  