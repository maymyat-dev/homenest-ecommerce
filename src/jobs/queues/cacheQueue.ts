import { qstash } from "../../utils/qstash";

export async function enqueueCacheInvalidation(data: any) {
  console.log("Attempting to publish to QStash...", data);
  await qstash.publishJSON({
    url: "https://homenest.backend.maymyatmon.com/api/v1/cache/invalidate",
    body: data,
    retries: 3,
    delay: 1,
  });
}
