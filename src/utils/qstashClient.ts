import { Client } from "@upstash/qstash";
import { Receiver } from "@upstash/qstash";
import "dotenv/config";

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export const qstashReceiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});
