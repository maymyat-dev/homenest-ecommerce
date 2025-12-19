import { Worker } from "bullmq";
import { redis } from "../../../config/redisClient";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../../services/prismaClient";


const imageWorker = new Worker(
  "imageQueue",
  async (job) => {
    try {
      const { filePath, imageId, postId, width, height, quality = 80 } = job.data;

      if (!filePath) throw new Error("filePath missing");

      const optimizedBuffer = await sharp(filePath)
        .resize(width || undefined, height || undefined)
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
      if (!cloudinaryUrl) throw new Error("Cloudinary URL missing");

      if (postId) {
        await prisma.post.update({
          where: { id: Number(postId) },
          data: { image: cloudinaryUrl },
        });
      } else if (imageId) {
        await prisma.image.update({
          where: { id: Number(imageId) },
          data: { path: cloudinaryUrl },
        });
      }
    } catch (error) {
      console.error("Image Worker Failed ❌", error);
    }
  },
  { connection: redis }
);
