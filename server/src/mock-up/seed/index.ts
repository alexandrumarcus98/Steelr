import "@/config/env";
import bcrypt from "bcryptjs";
import { connectToDatabase, disconnectFromDatabase } from "@/config/database";
import { PostModel, UserModel, ViewModel } from "@/models";

const SALT_ROUNDS = 12;

const seedData = async () => {
	try {
		await connectToDatabase();
		console.log("Connected to database");

		// Seed deterministic users with known plaintext credentials.
		const seedUsers = [
			{
				username: "alice_user",
				email: "alice@example.com",
				password: "alice12345",
			},
			{
				username: "bob_user",
				email: "bob@example.com",
				password: "bob12345",
			},
			{
				username: "carol_user",
				email: "carol@example.com",
				password: "carol12345",
			},
		] as const;

		const users = await Promise.all(
			seedUsers.map(async (seedUser) => {
				const passwordHash = await bcrypt.hash(seedUser.password, SALT_ROUNDS);

				return UserModel.findOneAndUpdate(
					{ email: seedUser.email },
					{
						username: seedUser.username,
						email: seedUser.email,
						passwordHash,
						isVerified: true,
						isActive: true,
					},
					{ upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
				).exec();
			})
		);

		// Create sample posts
		const postsData = [
			{
				author: users[0]._id,
				content: "Just finished an amazing project! Feeling productive today 🚀",
				visibility: "public",
				likesCount: 45,
				commentsCount: 8,
			},
			{
				author: users[1]._id,
				content: "Weather is beautiful today, perfect for a walk in the park ☀️",
				visibility: "public",
				likesCount: 32,
				commentsCount: 5,
			},
			{
				author: users[2]._id,
				content: "Just launched my new portfolio website! Check it out and let me know your thoughts 💼",
				visibility: "public",
				likesCount: 78,
				commentsCount: 12,
			},
			{
				author: users[0]._id,
				content: "Learning TypeScript has been a game-changer for my development skills 📚",
				visibility: "public",
				likesCount: 92,
				commentsCount: 15,
			},
			{
				author: users[1]._id,
				content: "Coffee and code - the perfect combination for a productive morning ☕",
				visibility: "public",
				likesCount: 56,
				commentsCount: 10,
			},
			{
				author: users[2]._id,
				content: "Just got approved for my first tech talk at a conference! So excited! 🎤",
				visibility: "public",
				likesCount: 110,
				commentsCount: 20,
			},
			{
				author: users[0]._id,
				content: "Open source contributions are a great way to learn and give back to the community 🌍",
				visibility: "public",
				likesCount: 67,
				commentsCount: 14,
			},
			{
				author: users[1]._id,
				content: "Finally fixed that bug that has been haunting me for days! 🐛",
				visibility: "public",
				likesCount: 88,
				commentsCount: 18,
			},
			{
				author: users[2]._id,
				content: "Excited to announce I'm joining a new startup as a Senior Developer! 🎉",
				visibility: "public",
				likesCount: 145,
				commentsCount: 35,
			},
			{
				author: users[0]._id,
				content: "Just discovered this amazing library that makes state management so much easier 💪",
				visibility: "public",
				likesCount: 73,
				commentsCount: 11,
			},
		];

		const posts = await PostModel.create(postsData);
		console.log(`Created ${posts.length} posts`);

		// Create views with different counts per post
		const viewCounts = [120, 95, 180, 210, 75, 250, 130, 160, 280, 110];

		for (let i = 0; i < posts.length; i++) {
			const post = posts[i];
			const viewCount = viewCounts[i];

			// Create views from random users
			for (let v = 0; v < viewCount; v++) {
				const randomUser = users[Math.floor(Math.random() * users.length)];
				try {
					// Use upsert to avoid duplicates
					await ViewModel.updateOne(
						{ post: post._id, user: randomUser._id },
						{
							post: post._id,
							user: randomUser._id,
							createdAt: new Date(
								Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
							), // Last 7 days
						},
						{ upsert: true }
					);
				} catch (err) {
					// Ignore duplicate key errors
				}
			}

			// Update post views count
			const actualViews = await ViewModel.countDocuments({ post: post._id });
			await PostModel.findByIdAndUpdate(post._id, { viewsCount: actualViews });
		}

		console.log("Created views for all posts");

		// Verify data
		const postCount = await PostModel.countDocuments();
		const viewCount = await ViewModel.countDocuments();
		console.log(`\nSeed completed!`);
		console.log(`Total posts: ${postCount}`);
		console.log(`Total views: ${viewCount}`);

		await disconnectFromDatabase();
		console.log("Disconnected from database");
	} catch (error) {
		console.error("Error seeding data:", error);
		process.exit(1);
	}
};

seedData();
