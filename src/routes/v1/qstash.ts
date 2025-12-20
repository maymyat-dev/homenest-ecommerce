import express from "express";
import {
  invalidateCacheHandler,
  processImageHandler,
} from "../../controllers/api/qstashController";

const router = express.Router();

router.post("/cache/invalidate", invalidateCacheHandler);
router.post(
  "/image/process",
  express.raw({ type: "*/*" }),
  processImageHandler
);

export default router;
