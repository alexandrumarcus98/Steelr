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

const LOCATION_POOL = [
	{ city: "Toronto", country: "Canada", region: "Ontario", continent: "North America" },
	{ city: "Vancouver", country: "Canada", region: "British Columbia", continent: "North America" },
	{ city: "Montreal", country: "Canada", region: "Quebec", continent: "North America" },
	{ city: "New York", country: "United States", region: "New York", continent: "North America" },
	{ city: "Chicago", country: "United States", region: "Illinois", continent: "North America" },
	{ city: "London", country: "United Kingdom", region: "England", continent: "Europe" },
	{ city: "Berlin", country: "Germany", region: "Berlin", continent: "Europe" },
	{ city: "Paris", country: "France", region: "Île-de-France", continent: "Europe" },
	{ city: "Madrid", country: "Spain", region: "Community of Madrid", continent: "Europe" },
	{ city: "Tokyo", country: "Japan", region: "Kanto", continent: "Asia" },
	{ city: "Cluj-Napoca", country: "Romania", region: "Cluj", continent: "Europe" },
];

const seedData = async () => {
	try {
		await connectToDatabase();
		console.log("Connected to database");

		// 1) Create many users
		const userDocs = Array.from({ length: USER_COUNT }).map(() => {
			const firstName = faker.person.firstName();
			const lastName = faker.person.lastName();
			const location = faker.helpers.arrayElement(LOCATION_POOL);
			return {
				username: faker.internet.username({ firstName, lastName }).toLowerCase(),
				email: faker.internet.email({ firstName, lastName }).toLowerCase(),
				passwordHash: bcrypt.hashSync("password123", SALT_ROUNDS), // known password for testing
				isVerified: true,
				isActive: true,
				signupIp: faker.internet.ip(),
				profileLocation: {
					...location,
					source: "seed" as const,
				},
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

		const friendSets = new Map<string, Set<string>>();
		const addFriendPair = (leftId: string, rightId: string) => {
			if (leftId === rightId) {
				return;
			}

			if (!friendSets.has(leftId)) {
				friendSets.set(leftId, new Set<string>());
			}

			if (!friendSets.has(rightId)) {
				friendSets.set(rightId, new Set<string>());
			}

			friendSets.get(leftId)?.add(rightId);
			friendSets.get(rightId)?.add(leftId);
		};

		const usersByCountry = new Map<string, typeof users>();
		const usersByContinent = new Map<string, typeof users>();

		for (const user of users) {
			const location = user.profileLocation as {
				country?: string;
				continent?: string;
			} | undefined;
			const country = location?.country || "Unknown";
			const continent = location?.continent || "Unknown";

			if (!usersByCountry.has(country)) {
				usersByCountry.set(country, []);
			}

			if (!usersByContinent.has(continent)) {
				usersByContinent.set(continent, []);
			}

			usersByCountry.get(country)?.push(user);
			usersByContinent.get(continent)?.push(user);
		}

		for (const group of usersByCountry.values()) {
			group.forEach((user, index) => {
				const next = group[(index + 1) % group.length];
				const nextTwo = group[(index + 2) % group.length];

				if (next) {
					addFriendPair(user._id.toString(), next._id.toString());
				}

				if (nextTwo && nextTwo._id.toString() !== user._id.toString()) {
					addFriendPair(user._id.toString(), nextTwo._id.toString());
				}
			});
		}

		for (const group of usersByContinent.values()) {
			if (group.length < 2) {
				continue;
			}

			for (const user of group) {
				const candidates = group.filter(
					(candidate) => candidate._id.toString() !== user._id.toString(),
				);
				const extraFriend = candidates[faker.number.int({ min: 0, max: candidates.length - 1 })];

				if (extraFriend) {
					addFriendPair(user._id.toString(), extraFriend._id.toString());
				}
			}
		}

		await Promise.all(
			users.map((user) =>
				UserModel.findByIdAndUpdate(
					user._id,
					{
						friendIds: Array.from(friendSets.get(user._id.toString()) ?? []),
					},
					{ new: false },
				).exec(),
			),
		);
		console.log("Created friend links");

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
