import { Worker } from "bullmq";
import { redis } from "../../../config/redisClient";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../../services/prismaClient";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const imageWorker = new Worker(
  "imageQueue",
  async (job) => {
    const { filePath, imageId, postId, width, height, quality } = job.data;

    console.log(`Processing Job: ${job.id} | imageId: ${imageId} | postId: ${postId}`);

    const optimizedBuffer = await sharp(filePath)
      .resize(width, height)
      .webp({ quality })
      .toBuffer();

    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "homenest_uploads" }, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(optimizedBuffer);
    });

    const cloudinaryUrl = uploadResult.secure_url;

    if (postId) {
      const updatedPost = await prisma.post.update({
        where: { id: Number(postId) },
        data: { image: cloudinaryUrl },
      });
      console.log("Post DB UPDATED ✅ ID:", updatedPost.id);
    } 
    else if (imageId) {
      const updatedImage = await prisma.image.update({
        where: { id: Number(imageId) },
        data: { path: cloudinaryUrl },
      });
      console.log("Product Image DB UPDATED ✅ ID:", updatedImage.id);
    } 
    else {
      console.warn("No valid ID (postId or imageId) provided in job data.");
    }

  },
  { connection: redis }
);
