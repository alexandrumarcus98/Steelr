import "@/config/env";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectToDatabase, disconnectFromDatabase } from "@/config/database";
import { PostModel, UserModel, ViewModel, CommentModel } from "@/models";

const SALT_ROUNDS = 12;
const USER_COUNT = 50;    // tweak to 100, 200, etc.
const POST_COUNT = 100;
const COMMENTS_PER_POST_MIN = 2;
const COMMENTS_PER_POST_MAX = 15;

const seedData = async () => {
	try {
		await connectToDatabase();
		console.log("Connected to database");

		// 1) Create many users
		const userDocs = Array.from({ length: USER_COUNT }).map(() => {
			const firstName = faker.person.firstName();
			const lastName = faker.person.lastName();
			return {
				username: faker.internet.username({ firstName, lastName }).toLowerCase(),
				email: faker.internet.email({ firstName, lastName }).toLowerCase(),
				passwordHash: bcrypt.hashSync("password123", SALT_ROUNDS), // known password for testing
				isVerified: true,
				isActive: true,
			};
		});

		// Upsert users by email
		const users = await Promise.all(
			userDocs.map((u) =>
				UserModel.findOneAndUpdate(
					{ email: u.email },
					u,
					{ upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
				).exec()
			)
		);
		console.log(`Created ${users.length} users`);

		// 2) Create many posts
		const postContents = Array.from({ length: POST_COUNT }).map(() => ({
			content: faker.lorem.paragraph({ min: 1, max: 3 }),
			visibility: "public" as const,
			likesCount: faker.number.int({ min: 0, max: 500 }),
			commentsCount: 0, // will sync later
			viewsCount: 0,
			createdAt: faker.date.recent({ days: 30 }),
			updatedAt: faker.date.recent({ days: 30 }),
		}));

		const posts = await Promise.all(
			postContents.map((p, i) =>
				PostModel.create({
					...p,
					author: users[i % users.length]._id,
				})
			)
		);
		console.log(`Created ${posts.length} posts`);

		// 3) Bulk create views (random users viewing random posts)
		const allViews: any[] = [];
		const allComments: any[] = [];

		for (const post of posts) {
			// Views: random number of unique users
			const viewCount = faker.number.int({ min: 5, max: 300 });
			const viewerIds = new Set<string>();
			while (viewerIds.size < Math.min(viewCount, users.length)) {
				viewerIds.add(users[faker.number.int({ min: 0, max: users.length - 1 })]._id.toString());
			}
			for (const userId of viewerIds) {
				allViews.push({
					post: post._id,
					user: new mongoose.Types.ObjectId(userId),
					createdAt: faker.date.recent({ days: 60 }),
				});
			}

			// Comments: random count per post
			const commentCount = faker.number.int({
				min: COMMENTS_PER_POST_MIN,
				max: COMMENTS_PER_POST_MAX,
			});
			for (let c = 0; c < commentCount; c++) {
				const author = users[faker.number.int({ min: 0, max: users.length - 1 })];
				allComments.push({
					post: post._id,
					author: author._id,
					content: faker.lorem.sentences({ min: 1, max: 3 }),
					createdAt: faker.date.recent({ days: 60 }),
				});
			}
		}

		// Clear old seed data then bulk insert
		await Promise.all([ViewModel.deleteMany({}), CommentModel.deleteMany({})]);

		try {
			await ViewModel.insertMany(allViews, { ordered: false });
		} catch (err: any) {
			if (err.code !== 11000) throw err;
		}
		await CommentModel.insertMany(allComments, { ordered: false });
		console.log(`Inserted ${allViews.length} views, ${allComments.length} comments`);

		// 4) Sync counters
		await Promise.all(
			posts.map(async (post) => {
				const [actualViews, actualComments] = await Promise.all([
					ViewModel.countDocuments({ post: post._id }),
					CommentModel.countDocuments({ post: post._id }),
				]);
				await PostModel.findByIdAndUpdate(post._id, {
					viewsCount: actualViews,
					commentsCount: actualComments,
				});
			})
		);
		console.log("Counters synced");

		const [postCount, viewCount, commentCount] = await Promise.all([
			PostModel.countDocuments(),
			ViewModel.countDocuments(),
			CommentModel.countDocuments(),
		]);

		console.log(`\nSeed completed!`);
		console.log(`Total posts: ${postCount}`);
		console.log(`Total views: ${viewCount}`);
		console.log(`Total comments: ${commentCount}`);

		await disconnectFromDatabase();
		console.log("Disconnected from database");
	} catch (error) {
		console.error("Error seeding data:", error);
		process.exit(1);
	}
};

seedData();
