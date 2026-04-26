// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import Login from "@components/login";
import Register from "@components/register";
import RecoverPassword from "@components/recover-password";
import ResetPassword from "@components/reset-password";
import Dashboard from "@components/dashboard";
import Feed from "@components/feed";
import Conversations from "@components/conversations";
import Profile from "@components/profile";
import Users from "@components/users";
import RequireAuth from "@components/auth/RequireAuth";
import DefaultLayout from "@layouts/default";
import FullLayout from "@layouts/full";
import { AuthProvider } from "./providers/auth";
import { store } from "./store";

import "@css/App.css";
import "@sass/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Provider store={store}>
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						{/* Use FullLayout for auth pages */}
						<Route path="/login" element={<FullLayout />}>
							<Route index element={<Login />} />
						</Route>
						<Route path="/register" element={<FullLayout />}>
							<Route index element={<Register />} />
						</Route>
						<Route path="/recover-password" element={<FullLayout />}>
							<Route index element={<RecoverPassword />} />
						</Route>
						<Route path="/reset-password" element={<FullLayout />}>
							<Route index element={<ResetPassword />} />
						</Route>

						{/* Use DefaultLayout for all app pages */}
						<Route path="/*" element={<DefaultLayout />}>
							<Route path="" element={<App />} />
							<Route element={<RequireAuth />}>
								<Route path="dashboard" element={<Dashboard />} />
								<Route path="feed" element={<Feed />} />
								<Route path="conversations" element={<Conversations />} />
								<Route path="profile" element={<Profile />} />
								<Route path="users" element={<Users />} />
							</Route>
							<Route path="*" element={<App />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</Provider>
	</React.StrictMode>,
);
