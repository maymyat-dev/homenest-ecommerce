import { redis } from "../../config/redisClient";

export const getOrSetCache = async <T>(
  key: string,
  cb: () => Promise<T>
): Promise<T> => {
  try {
    const cachedData = await redis.get<string>(key);

    if (cachedData) {
      console.log("Cache hit");
      try {
        return JSON.parse(cachedData) as T;
      } catch {
        // ❗ corrupted cache
        await redis.del(key);
      }
    }

    console.log("Cache miss");
    const freshData = await cb();

    await redis.setex(key, 3600, JSON.stringify(freshData));
    return freshData;
  } catch (error) {
    console.error("Redis error:", error);
    return cb(); // ❗ Redis fail ≠ API fail
  }
};

