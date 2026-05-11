import express from "express";
import cors, { CorsOptions } from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import logger from "morgan";

import "./config/env";

import { errorHandler } from "@/middleware";
import router from "@/routes";

const app = express();

const allowedOrigins = (
	process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173"
)
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
			return;
		}

		callback(new Error("CORS origin not allowed"));
	},
	credentials: true,
};

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Too many requests, please try again later." },
});

app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(hpp());
app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);
app.use("/api", router);
app.use(errorHandler); // Must be after all routes

export default app;
