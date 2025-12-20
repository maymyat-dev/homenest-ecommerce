import { qstash } from "../../utils/qstash";

export async function enqueueCacheInvalidation(data: any) {
  await qstash.publishJSON({
    url: "https://homenest.backend.maymyatmon.com/api/v1/cache/invalidate",
    body: data,
    retries: 3,
    delay: 1,
  });
}
