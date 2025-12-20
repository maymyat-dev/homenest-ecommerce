import { qstash } from "../../utils/qstash";

export async function enqueueCacheInvalidation(data: any) {
  console.log("Attempting to publish to QStash...", data); 
  try {
    const result = await qstash.publishJSON({
      url: "https://homenest.backend.maymyatmon.com/api/v1/qstash/cache/invalidate",
      body: data,
      retries: 3,
      delay: 1,
    });
    console.log("QStash Publish Success:", result); 
  } catch (error) {
    console.error("QStash Publish Failed:", error); 
  }
}
