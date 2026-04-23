// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import Login from "@components/login";
import Register from "@components/register";
import DefaultLayout from "@layouts/default";
import FullLayout from "@layouts/full";

import "@sass/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				{/* Use FullLayout for auth pages */}
				<Route path="/login" element={<FullLayout />}>
					<Route index element={<Login />} />
				</Route>
				<Route path="/register" element={<FullLayout />}>
					<Route index element={<Register />} />
				</Route>

				{/* Use DefaultLayout for all other routes */}
				<Route path="/*" element={<DefaultLayout />}>
					<Route path="*" element={<App />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>,
);
