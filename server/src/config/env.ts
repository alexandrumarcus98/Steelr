import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const projectRoot = path.resolve(__dirname, "..", "..");
const envPath = path.join(projectRoot, ".env");
const envDevPath = path.join(projectRoot, ".env.dev");

if (fs.existsSync(envPath)) {
	dotenv.config({ path: envPath });
}

if (process.env.NODE_ENV !== "production" && fs.existsSync(envDevPath)) {
	dotenv.config({ path: envDevPath, override: true });
}
