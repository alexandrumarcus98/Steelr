import React from "react";

import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ReactDOM from "react-dom/client";

import { AuthProvider } from "@/providers/auth";
import DefaultLayout from "@/providers/layouts/default";
import FullLayout from "@/providers/layouts/full";
import { ThemeProvider } from "@/providers/theme";
import ToastProvider from "@/providers/toast";

import Dashboard from "@/pages/dashboard";
import Feed from "@/pages/feed";
import LastVisitedPosts from "@/pages/feed/last-visited";
import MostViewedPosts from "@/pages/feed/most-viewed";
import App from "@/pages/home";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import OTP from "@/pages/otp";
import PostPage from "@/pages/post/post-page";
import RecoverPassword from "@/pages/recover-password";
import Register from "@/pages/register";
import ResetPassword from "@/pages/reset-password";
import Profile from "@/pages/user/profile";

import RequireAuth from "@/components/auth/require-auth";
import { RequireGuest } from "@/components/auth/require-guest";
import Users from "@/components/users";

import { store } from "@/store";

import "@/assets/css/App.css";

import "@/assets/sass/global.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Provider store={store}>
			<ThemeProvider>
				<ToastProvider>
					<AuthProvider>
						<BrowserRouter>
							<Routes>
								{/* Auth pages layout */}
								<Route element={<FullLayout />}>
									<Route element={<RequireGuest />}>
										<Route path="/login" element={<Login />} />
										<Route path="/otp" element={<OTP />} />
										<Route path="/register" element={<Register />} />
										<Route path="/recover-password" element={<RecoverPassword />} />
										<Route path="/reset-password" element={<ResetPassword />} />
									</Route>
								</Route>

								<Route path="/*" element={<DefaultLayout />}>
									<Route path="" element={<App />} />
									<Route element={<RequireAuth />}>
										<Route path="dashboard" element={<Dashboard />} />
										<Route path="feed" element={<Feed />} />
										<Route path="posts/most-viewed" element={<MostViewedPosts />} />
										<Route path="posts/last-visited" element={<LastVisitedPosts />} />
										<Route path="profile" element={<Profile />} />
										<Route path="users" element={<Users />} />
										<Route path="posts/:id" element={<PostPage />} />
									</Route>
									<Route path="*" element={<NotFound />} />
								</Route>
							</Routes>
						</BrowserRouter>
					</AuthProvider>
				</ToastProvider>
			</ThemeProvider>
		</Provider>
	</React.StrictMode>,
);
