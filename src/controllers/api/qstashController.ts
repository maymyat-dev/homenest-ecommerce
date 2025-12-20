import { RequestHandler } from "express";
import { qstashReceiver } from "../../utils/qstashClient";
import { invalidateCache } from "../../jobs/cache/invalidateCache";
import { processImage } from "../../jobs/image/processImage";
import { sendTelegramMessage } from "../../utils/telegram";

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
  console.log("processImageHandler", req.headers);
  await sendTelegramMessage("Headers: " + JSON.stringify(req.headers));
  const signature = req.headers["upstash-signature"] as string;

  console.log(
    "processImageHandler",
    req.body, // Buffer (this is GOOD)
    signature,
    req.originalUrl
  );

  if (!signature) {
    await sendTelegramMessage("Missing QStash signature");
    res.status(401).json({ error: "Missing QStash signature" });
    return;
  }

  const isValid = await qstashReceiver.verify({
    signature,
    body: req.body, // 🔥 RAW BODY
    url: req.originalUrl, // must match exactly
  });

  if (!isValid) {
    await sendTelegramMessage("Invalid QStash signature");
    res.status(401).json({ error: "Invalid QStash signature" });
    return;
  }

  try {
    await processImage(req.body);
    res.status(200).json({ ok: true });
    return;
  } catch (err) {
    await sendTelegramMessage(`processImage failed: ${err}`);
    console.error("processImage failed:", err);
    res.status(200).json({ ok: false });
    return;
  }
};
