import React, { useState, useEffect } from "react";
import { useAuth } from "../../providers/auth";
import api from "../../lib/api";

interface User {
	id: string;
	username: string;
	email: string;
	roles: string[];
	status: string;
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

	if (loading) return <div>Loading users...</div>;
	if (error) return <div className="text-red-500">{error}</div>;

	return (
		<div className="max-w-6xl mx-auto">
			<h1 className="text-3xl font-bold mb-8">User Management</h1>

			<div className="bg-white shadow-md rounded-lg overflow-hidden">
				<table className="w-full">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Username
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Email
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Roles
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{users.map((u) => (
							<tr key={u.id}>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{u.username}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{u.email}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{u.roles?.join(", ") || "user"}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{u.status}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button className="text-blue-600 hover:text-blue-900 mr-4">
										Edit
									</button>
									<button className="text-red-600 hover:text-red-900">
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
