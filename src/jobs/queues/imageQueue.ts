
import { qstash } from "../../utils/qstashClient";

export async function enqueueImageJob(data: any) {
  return await qstash.publishJSON({
    url: "https://homenest.backend.maymyatmon.com/api/v1/qstash/image/process",
    body: data,
  });
}
