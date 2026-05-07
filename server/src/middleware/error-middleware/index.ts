import type { NextFunction, Request, Response } from "express";

// Global JSON error handler — must be after all routes
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
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
};

