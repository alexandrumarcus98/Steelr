// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";

import { RequireGuest } from "@/components/auth/require-guest";
import { AuthProvider } from "@/providers/auth";
import RequireAuth from "@/components/auth/require-auth";
import { store } from "@/store";

import DefaultLayout from "@/providers/layouts/default";
import FullLayout from "@/providers/layouts/full";

import App from "@/App";
import Login from "@/pages/login";
import Register from "@/pages/register";
import RecoverPassword from "@/pages/recover-password";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import Feed from "@/pages/feed";
import MostViewedPosts from "@/pages/feed/most-viewed";
import LastVisitedPosts from "@/pages/feed/last-visited";
import PostPage from "@/pages/post/post-page";
import Profile from "@/pages/user/profile";
import Users from "@/components/users";

import "@/assets/css/App.css";
import "@/assets/sass/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Provider store={store}>
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						{/* Auth pages layout */}
						<Route element={<FullLayout />}>
							<Route element={<RequireGuest />}>
								<Route path="/login" element={<Login />} />
								<Route path="/register" element={<Register />} />
								<Route path="/recover-password" element={<RecoverPassword />} />
								<Route path="/reset-password" element={<ResetPassword />} />
							</Route>
						</Route>

						{/* Use DefaultLayout for all app pages */}
						<Route path="/*" element={<DefaultLayout />}>
							<Route path="" element={<App />} />
							<Route element={<RequireAuth />}>
								<Route path="dashboard" element={<Dashboard />} />
								<Route path="feed" element={<Feed />} />
								<Route path="posts/most-viewed" element={<MostViewedPosts />} />
								<Route
									path="posts/last-visited"
									element={<LastVisitedPosts />}
								/>
								<Route path="profile" element={<Profile />} />
								<Route path="users" element={<Users />} />
								<Route path="posts/:id" element={<PostPage />} />
							</Route>
							<Route path="*" element={<App />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</Provider>
	</React.StrictMode>,
);
