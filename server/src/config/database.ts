import mongoose from "mongoose";

const getMongoUri = (): string => {
	const mongoUri = process.env.MONGODB_URI;

	if (!mongoUri) {
		throw new Error(
			"Missing MONGODB_URI environment variable. Set it in server/.env or export it before running commands like `pnpm seed`."
		);
	}

	return mongoUri;
};

export const connectToDatabase = async (): Promise<void> => {
	const mongoUri = getMongoUri();
	const dbName = process.env.MONGODB_DB_NAME;

	await mongoose.connect(mongoUri, {
		dbName,
	});

	console.log("MongoDB connected");
};

export const disconnectFromDatabase = async (): Promise<void> => {
	if (mongoose.connection.readyState === 0) {
		return;
	}

	await mongoose.disconnect();
	console.log("MongoDB disconnected");
};
