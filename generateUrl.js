import dotenv from "dotenv";
dotenv.config();

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const generatePresignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key, // your file key
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
  return url;
};

(async () => {
  try {
    const key = "uploads/1757264844703-graph1.png"; // from your S3 object
    const url = await generatePresignedUrl(key);
    console.log("Presigned URL:", url);
  } catch (err) {
    console.error("Error generating presigned URL:", err);
  }
})();
