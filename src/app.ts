import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import limiter from "./middlewares/rateLimiter";
import cookieParser from "cookie-parser";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import * as middleware from "i18next-http-middleware";
import path from "path";
import routes from "./routes/v1";
import bodyParser from "body-parser";
import { stripeWebhook } from "./controllers/api/OrderController";

export const app = express();

/* ----------------------------- BASIC SETUP ----------------------------- */
app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", "src/views");

/* ----------------------------- CORS (MUST BE FIRST) ----------------------------- */
const corsOptions: cors.CorsOptions = {
  origin: ["http://localhost:5173", "https://homenest.maymyatmon.com"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ----------------------------- LOGGING ----------------------------- */
app.use(morgan("dev"));

/* ----------------------------- STRIPE WEBHOOK ----------------------------- */
/* Must be BEFORE express.json() */
app.post(
  "/api/v1/user/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

/* ----------------------------- BODY PARSERS ----------------------------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

/* ----------------------------- SECURITY & PERFORMANCE ----------------------------- */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(limiter);

/* ----------------------------- I18N ----------------------------- */
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(
        process.cwd(),
        "src/locales",
        "{{lng}}",
        "{{ns}}.json"
      ),
    },
    detection: {
      order: ["querystring", "cookie", "header"],
      caches: ["cookie"],
    },
    fallbackLng: "en",
    preload: ["en", "mm"],
  });

app.use(middleware.handle(i18next));

/* ----------------------------- STATIC & ROUTES ----------------------------- */
app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.send("HomeNest Backend is running!");
});

app.use("/api/v1", routes);

/* ----------------------------- ERROR HANDLER ----------------------------- */
app.use(
  (error: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = error.status || 500;
    const message = error.message || "Server Error";
    const errorCode = error.errorCode || "ERROR_CODE";

    res.status(status).json({
      message,
      error: errorCode,
    });
  }
);

export default app;
