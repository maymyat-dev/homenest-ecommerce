import { RequestHandler } from "express";
import { qstashReceiver } from "../../utils/qstashClient";
import { invalidateCache } from "../../jobs/cache/invalidateCache";
import { processImage } from "../../jobs/image/processImage";

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
  const isValid = await qstashReceiver.verify({
    signature: req.headers["upstash-signature"] as string,
    body: JSON.stringify(req.body),
    url: req.originalUrl,
  });

  if (!isValid) {
    res.status(401).json({ error: "Invalid QStash signature" });
    return;
  }

  try {
    await processImage(req.body);
  } catch (error) {
    console.error("processImage failed ❌", error);

  
    res.status(200).json({ ok: false });
    return;
  }

  res.status(200).json({ ok: true });
};







