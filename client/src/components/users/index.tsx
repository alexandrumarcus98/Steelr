import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth";
import api from "@/lib/api";

interface User {
	id: string;
	username: string;
	email: string;
	roles: string[];
	isActive: boolean;
	isVerified: boolean;
}

const Users: React.FC = () => {
	const { user } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const { data } = await api.get("/users");
				setUsers(data.data || data);
			} catch (err: any) {
				setError(err.response?.data?.message || "Failed to load users");
			} finally {
				setLoading(false);
			}
		};

		if (user?.roles?.includes("admin")) {
			fetchUsers();
		} else {
			setError("Access denied. Admin role required.");
			setLoading(false);
		}
	}, [user]);

  if (loading) return <div className="text-sm text-slate-600 dark:text-slate-400">Loading users...</div>;
  if (error) return <div className="text-sm text-red-600 dark:text-red-400">{error}</div>;

	return (
		<div className="mx-auto max-w-6xl">
			<h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-slate-50">User Management</h1>

			<div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-slate-900">
				<table className="w-full">
					<thead className="bg-slate-50 dark:bg-slate-800">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
								Username
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
								Email
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
								Roles
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
						{users.map((u) => (
							<tr key={u.id}>
								<td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
									{u.username}
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
									{u.email}
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
									{u.roles?.join(", ") || "user"}
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
									{u.isActive ? "Active" : "Inactive"} / {u.isVerified ? "Verified" : "Unverified"}
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
									<button className="mr-4 text-sky-600 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">
										Edit
									</button>
									<button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
										Delete
									</button>
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
