import { RequestHandler } from "express";
import { qstashReceiver } from "../../utils/qstashClient";
import { invalidateCache } from "../../jobs/cache/invalidateCache";
import { prisma } from "../../services/prismaClient";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const invalidateCacheHandler: RequestHandler = async (req, res) => {
  const isValid = await qstashReceiver.verify({
    signature: req.headers["upstash-signature"] as string,
    body: JSON.stringify(req.body),
    url: req.originalUrl,
  });

  if (!isValid) {
    res.status(401).json({ error: "Invalid QStash signature" });
    return;
  }

  const { key } = req.body;
  await invalidateCache(key);

  res.json({ ok: true });
};

export const processImageHandler: RequestHandler = async (req, res) => {
  const rawBody = req.body.toString(); 

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["host"];
  const fullUrl = `${protocol}://${host}${req.originalUrl}`;

  const isValid = await qstashReceiver.verify({
    signature: req.headers["upstash-signature"] as string,
    body: rawBody,
    url: fullUrl,
  });

  if (!isValid) {
    console.error("❌ QStash verification failed for:", fullUrl);
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const data = JSON.parse(rawBody);
    const { filePath, productId } = data;

  
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "homenest-images",
    });

  
    await prisma.image.create({
      data: {
        path: uploadResult.secure_url,
        productId: Number(productId),
      },
    });

    res.json({ ok: true });
  } catch (error: any) {
    console.error("🚨 Processing Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};




