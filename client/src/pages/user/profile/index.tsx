import React, { useState } from "react";
import { useAuth } from "@/providers/auth";

const Profile: React.FC = () => {
	const { user } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		username: user?.username || "",
		email: user?.email || "",
	});

	if (!user) {
		return <div>Please log in to view your profile.</div>;
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement update profile API call
		console.log("Update profile:", formData);
		setIsEditing(false);
	};

	return (
		<div className="max-w-2xl mx-auto">
			<h1 className="text-3xl font-bold mb-8">Profile</h1>

			<div className="bg-white shadow-md rounded-lg p-6">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold">Personal Information</h2>
					<button
						onClick={() => setIsEditing(!isEditing)}
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						{isEditing ? "Cancel" : "Edit"}
					</button>
				</div>

				{isEditing ? (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Username
							</label>
							<input
								type="text"
								value={formData.username}
								onChange={(e) =>
									setFormData({ ...formData, username: e.target.value })
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Email
							</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<button
							type="submit"
							className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
						>
							Save Changes
						</button>
					</form>
				) : (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Username
							</label>
							<p className="mt-1 text-gray-900">{user.username}</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Email
							</label>
							<p className="mt-1 text-gray-900">{user.email}</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Roles
							</label>
							<p className="mt-1 text-gray-900">
								{user.roles?.join(", ") || "user"}
							</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Status
							</label>
							<p className="mt-1 text-gray-900">{user.isActive ? "Active" : "Inactive"} / {user.isVerified ? "Verified" : "Unverified"}</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Profile;
