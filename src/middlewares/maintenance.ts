import { Request, Response, NextFunction } from "express";
import { getSettingStatus } from "../services/settingService";
import { errorCode } from "../../config/errorCode";
import { createError } from "../utils/error";

const whiteLists = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];
export const maintenance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";


  if (whiteLists.some(allowedIp => ip.includes(allowedIp))) {
    return next();
  }

  try {
    const setting = await getSettingStatus("maintenance");
    if (setting?.value === "true") {
  
      return next(
        createError(
          "This server is currently under maintenance. Please try again later.",
          503, 
          errorCode.maintenance
        )
      );
    }
    next();
  } catch (error) {
   
    next();
  }
};
