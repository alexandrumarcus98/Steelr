import React, { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsers } from "@/store/api/usersApi";

const Users: React.FC = () => {
	const { user } = useAuth();
	const dispatch = useAppDispatch();
	const { items: users, status, error } = useAppSelector((state) => state.users);

	useEffect(() => {
		if (!user) return;
		if (!user.roles?.includes("admin")) return;

		if (status === "idle") {
			dispatch(fetchUsers());
		}
	}, [dispatch, user, status]);

	if (!user) {
		return <div className="text-sm text-red-300">You must be logged in to view users.</div>;
	}
	if (!user.roles?.includes("admin")) {
		return <div className="text-sm text-red-300">Access denied. Admin role required.</div>;
	}
	if (status === "loading") {
		return <div className="text-sm text-slate-600">Loading users...</div>;
	}
	if (status === "failed") {
		return <div className="text-sm text-red-300">{error ?? "Failed to load users"}</div>;
	}

	return (
		<div className="mx-auto max-w-6xl">
			<h1 className="font-display mb-8 text-3xl font-bold text-slate-50">User Management</h1>

			<div className="overflow-hidden rounded-lg border border-border-soft bg-surface shadow-md">
				<table className="w-full">
					<thead className="bg-white/5">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
								Username
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 ">
								Email
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 ">
								Roles
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 ">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 ">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border-soft">
						{users.map((u) => (
							<tr key={u.id}>
								<td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-100">
									{u.username}
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">{u.email}</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
									{u.roles?.join(", ") || "user"}
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
									{u.isActive ? "Active" : "Inactive"} / {u.isVerified ? "Verified" : "Unverified"}
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
									<button className="mr-4 text-cyan hover:opacity-80">Edit</button>
									<button className="text-red-300 hover:opacity-80">Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Users;
