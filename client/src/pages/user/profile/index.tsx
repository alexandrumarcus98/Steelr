import React, { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import api from "@/lib/api";
import { normalizeApiError } from "@/lib/apiError";

const Profile: React.FC = () => {
	const { user } = useAuth();
	const dispatch = useAppDispatch();
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		username: user?.username || "",
		email: user?.email || "",
		city: user?.location?.city || "",
		country: user?.location?.country || "",
		region: user?.location?.region || "",
		continent: user?.location?.continent || "",
	});

	if (!user) {
		return <div className="text-sm text-slate-400">Please log in to view your profile.</div>;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		try {
			setIsSaving(true);
			const { data } = await api.patch(`/users/${user.id}`, {
				username: formData.username.trim(),
				email: formData.email.trim(),
				location: {
					city: formData.city.trim(),
					country: formData.country.trim(),
					region: formData.region.trim(),
					continent: formData.continent.trim(),
					source: "manual",
				},
			});

			dispatch(setUser(data.user));
			setIsEditing(false);
		} catch (err) {
			const { message } = normalizeApiError(err, "Failed to update profile. Please try again.");
			setError(message);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="mx-auto max-w-2xl">
			<h1 className="font-display mb-8 text-3xl font-bold text-slate-50">Profile</h1>

			<div className="rounded-lg border border-border-soft bg-surface p-6 shadow-md">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-xl font-semibold text-slate-50">Personal Information</h2>
					<button
						onClick={() => setIsEditing(!isEditing)}
						className="rounded bg-cyan px-4 py-2 text-bg hover:opacity-90"
					>
						{isEditing ? "Cancel" : "Edit"}
					</button>
				</div>

				{isEditing ? (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="mb-1 block text-sm font-medium text-slate-300">Username</label>
							<input
								type="text"
								value={formData.username}
								onChange={(e) => setFormData({ ...formData, username: e.target.value })}
								className="w-full rounded-md border border-border-soft bg-bg/70 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan/15"
							/>
						</div>
						<div>
							<label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="w-full rounded-md border border-border-soft bg-bg/70 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan/15"
							/>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="mb-1 block text-sm font-medium text-slate-300">City</label>
								<input
									type="text"
									value={formData.city}
									onChange={(e) => setFormData({ ...formData, city: e.target.value })}
									className="w-full rounded-md border border-border-soft bg-bg/70 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan/15"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm font-medium text-slate-300">Country</label>
								<input
									type="text"
									value={formData.country}
									onChange={(e) => setFormData({ ...formData, country: e.target.value })}
									className="w-full rounded-md border border-border-soft bg-bg/70 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan/15"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm font-medium">Region</label>
								<input
									type="text"
									value={formData.region}
									onChange={(e) => setFormData({ ...formData, region: e.target.value })}
									className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm font-medium">Continent</label>
								<input
									type="text"
									value={formData.continent}
									onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
									className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
								/>
							</div>
						</div>
						<button
							type="submit"
							disabled={isSaving}
							className="rounded bg-emerald-500 px-4 py-2 text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isSaving ? "Saving..." : "Save Changes"}
						</button>
						{error && <p className="text-sm text-red-300">{error}</p>}
					</form>
				) : (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-slate-300">Username</label>
							<p className="mt-1 text-slate-100">{user.username}</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-300">Email</label>
							<p className="mt-1 text-slate-100">{user.email}</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-300">Roles</label>
							<p className="mt-1 text-slate-100">{user.roles?.join(", ") || "user"}</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-300">Status</label>
							<p className="mt-1 text-slate-100">
								{user.isActive ? "Active" : "Inactive"} /{" "}
								{user.isVerified ? "Verified" : "Unverified"}
							</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-300">Location</label>
							<p className="mt-1 text-slate-100">
								{user.location?.city || user.location?.country
									? [
											user.location?.city,
											user.location?.country,
											user.location?.region,
											user.location?.continent,
										]
											.filter(Boolean)
											.join(", ")
									: "Not set"}
							</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-300">Friends</label>
							<p className="mt-1 text-slate-100">{user.friendsCount}</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Profile;
