// import { Redis } from "ioredis";

// export const redis = new Redis({
//     host: process.env.REDIS_HOST,
//     port: Number(process.env.REDIS_PORT!) || 6379,
//     password: process.env.REDIS_PASSWORD || undefined,
//     // port: parseInt(process.env.REDIS_PORT!),
//     maxRetriesPerRequest: null, //for bullMQ
    
//     // Reconnection Strategy
//     retryStrategy(times) {
//         // Exponential backoff: wait longer after each failed attempt
//         console.log(`[Redis] Retrying connection: attempt ${times}. Next try in 10 seconds...`);
//         return 10000;
//     },
//     // tls: {}, {
// },)

// import { Redis } from "@upstash/redis";


// const globalForRedis = global as unknown as { redis: Redis };

// export const redis =
//   globalForRedis.redis ||
//   new Redis({
//     url: process.env.UPSTASH_REDIS_REST_URL!,
//     token: process.env.UPSTASH_REDIS_REST_TOKEN!,
//   });

// if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});