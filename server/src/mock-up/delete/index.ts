import "@/config/env";
import { connectToDatabase, disconnectFromDatabase } from "@/config/database";
import { PostModel, UserModel, ViewModel } from "@/models";

const deleteData = async () => {
	try {
		await connectToDatabase();
		console.log("Connected to database");

		// Clear existing data
		await UserModel.deleteMany({});
		await PostModel.deleteMany({});
		await ViewModel.deleteMany({});
		console.log("Cleared existing posts, users and views");
	} catch (error) {
		console.error("Error deleting data:", error);
	} finally {
		await disconnectFromDatabase();
		console.log("Disconnected from database");
	}
};

deleteData().catch((error) => {
	console.error("Error in deleteData:", error);
	process.exit(1);
});
