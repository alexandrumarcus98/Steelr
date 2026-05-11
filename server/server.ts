import "./src/config/env";

import { disconnectFromDatabase, connectToDatabase } from "./src/config/database";
import app from "./src/app";

const PORT = process.env.PORT || 3001;

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
