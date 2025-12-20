
import { qstash } from "../../utils/qstash";

export async function enqueueImageJob(data: any) {
  return await qstash.publishJSON({
    url: "https://homenest.backend.maymyatmon.com/api/v1/qstash/images/process",
    body: data,
  });
}
