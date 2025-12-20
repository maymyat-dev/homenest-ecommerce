import { qstash } from "../../utils/qstashClient";
import { sendTelegramMessage } from "../../utils/telegram";

export async function enqueueImageJob(data: any) {
  console.log("Attempting to publish to QStash...", data);
  await sendTelegramMessage(`Attempting to publish to QStash..., ${data}`);
  return await qstash.publishJSON({
    url: "https://homenest.backend.maymyatmon.com/api/v1/qstash/image/process",
    body: data,
  });
}
