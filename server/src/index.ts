import "./config/env";
import cors, { CorsOptions } from "cors";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { disconnectFromDatabase, connectToDatabase } from "@/config/database";
import router from "@/routes";

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);
app.use("/api", router);

// Global JSON error handler — must be after all routes
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
	const status =
		typeof (err as Record<string, unknown>)?.status === "number"
			? ((err as Record<string, unknown>).status as number)
			: 500;
	const message =
		err instanceof Error ? err.message : "Internal Server Error";
	const isDev = process.env.NODE_ENV !== "production";

	res.status(status).json({
		message,
		...(isDev && err instanceof Error ? { stack: err.stack } : {}),
	});
});

const startServer = async (): Promise<void> => {
	await connectToDatabase();

	const server = app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});

	const shutdown = async (signal: string): Promise<void> => {
		console.log(`Received ${signal}. Shutting down gracefully...`);

		server.close(async (error) => {
			if (error) {
				console.error("Error during server shutdown", error);
				process.exitCode = 1;
			}

			try {
				await disconnectFromDatabase();
			} catch (dbError) {
				console.error("Error during DB shutdown", dbError);
				process.exitCode = 1;
			}

			process.exit();
		});

		setTimeout(() => {
			console.error("Forcing shutdown after timeout");
			process.exit(1);
		}, 10000).unref();
	};

	["SIGINT", "SIGTERM"].forEach((signal) => {
		process.on(signal, () => {
			void shutdown(signal);
		});
	});
};

void startServer().catch((error: unknown) => {
	console.error("Failed to start server", error);
	process.exit(1);
});

export default app;
