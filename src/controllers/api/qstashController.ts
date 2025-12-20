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
  console.log("isBuffer:", Buffer.isBuffer(req.body));

  await sendTelegramMessage(`isBuffer: ${Buffer.isBuffer(req.body)}`);

  const signature = req.headers["upstash-signature"] as string;

  await sendTelegramMessage(`signature: ${signature}, body: ${req.body}`);

  if (!signature) {
    await sendTelegramMessage("Missing QStash signature");
    res.status(401).json({ error: "Missing QStash signature" });
    return;
  }

  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  await sendTelegramMessage(`fullUrl: ${fullUrl}`);
  try {
    const isValid = await qstashReceiver.verify({
      signature,
      body: req.body, // raw buffer
      url: fullUrl, // 🔥 FULL URL
    });

    await sendTelegramMessage(`isValid: ${isValid}`);

    await sendTelegramMessage(`Processing image: ${JSON.stringify(req.body)}`);
    const payload = JSON.parse(req.body.toString());
    await processImage(payload);
    res.status(200).json({ ok: true });
    return;
  } catch (err) {
    await sendTelegramMessage(`processImage failed: ${err}`);
    console.error("processImage failed:", err);
    res.status(200).json({ ok: false });
    return;
  }
};
