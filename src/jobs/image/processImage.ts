import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../../services/prismaClient";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function processImage(data: {
  imageId: string;
  imageUrl: string;
}) {
  const { imageId, imageUrl } = data;

  if (!imageUrl || !imageId) {
    throw new Error("imageUrl or imageId missing");
  }

  console.log("Processing image:", imageId);

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  const optimizedBuffer = await sharp(buffer)
    .webp({ quality: 80 })
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

  if (!uploadResult?.secure_url) {
    throw new Error("Cloudinary upload failed");
  }

  await prisma.image.update({
    where: { id: Number(imageId) },
    data: { path: uploadResult.secure_url },
  });

  console.log("Image processed ✅", uploadResult.secure_url);
}

