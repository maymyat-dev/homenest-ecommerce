import { redis } from "../../../config/redisClient";


export async function invalidateCache(key: string) {
  await redis.del(key);
}