import express from "express";
import {
  invalidateCacheHandler,
  processImageHandler,
} from "../../controllers/api/qstashController";

export const config = {
  api: {
    bodyParser: false,
  },
};

const router = express.Router();

router.post("/cache/invalidate", invalidateCacheHandler);
router.post(
  "/image/process",
  express.raw({ type: "application/json" }),
  processImageHandler
);

export default router;
