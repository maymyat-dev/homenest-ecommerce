import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../../services/prismaClient";
import { sendTelegramMessage } from "../../utils/telegram";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function processImage(data: any) {
  try {
    await sendTelegramMessage(`Processing image: ${JSON.stringify(data)}`);
    console.log("Processing image:", data);
    const { filePath, imageId, postId, width, height, quality = 80 } = data;

    if (!filePath) throw new Error("filePath missing");

    const optimizedBuffer = await sharp(filePath)
      .resize(width || undefined, height || undefined)
      .webp({ quality })
      .toBuffer();

    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "homenest_uploads" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(optimizedBuffer);
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
  } catch (err) {
    await sendTelegramMessage(`processImage error: ${err}`);
    console.error("processImage error:", err);
    return false;
  }
}
