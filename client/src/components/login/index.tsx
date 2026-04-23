import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import "./login.scss";

const Login: React.FC = () => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>();

	const onSubmit = async (data: LoginFormData) => {
		try {
			const response = await axios.post("/api/auth/login", data);
			// Handle successful login (e.g., redirect, set authentication state)S
			console.log("Login successful:", response.data);
			// Example: Redirect to dashboard
			// window.location.href = '/dashboard';
		} catch (error: any) {
			// Handle login error
			console.error(
				"Login failed:",
				error.response?.data?.message || error.message,
			);
		}
	};

	return (
		<div className="login-page">
			<section className="login-card" aria-labelledby="login-title">
				<div className="login-logo" aria-hidden="true">
					SL
				</div>
				<h1 id="login-title">Sign in to your account</h1>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="login-form"
					noValidate
				>
					<div className="form-group">
						<label htmlFor="email">Email address</label>
						<input
							type="email"
							id="email"
							placeholder="name@company.com"
							{...register("email", {
								required: "Email is required",
								pattern: {
									value: /^[^\s@]+@[^\s]+\.[^\s]+$/,
									message: "Please enter a valid email address",
								},
							})}
						/>
						{errors.email && (
							<p className="error-text">{errors.email.message}</p>
						)}
					</div>

					<div className="form-group">
						<div className="label-row">
							<label htmlFor="password">Password</label>
							<a href="#" className="forgot-link">
								Forgot password?
							</a>
						</div>
						<input
							type="password"
							id="password"
							placeholder="Enter your password"
							{...register("password", {
								required: "Password is required",
								minLength: {
									value: 8,
									message: "Password must be at least 8 characters",
								},
							})}
						/>
						{errors.password && (
							<p className="error-text">{errors.password.message}</p>
						)}
					</div>

					<button type="submit" className="submit-btn" disabled={isSubmitting}>
						{isSubmitting ? "Signing in..." : "Sign in"}
					</button>
				</form>

				<p className="signup-copy">
					Not a member? <Link to="/register">Start your free trial</Link>
				</p>
			</section>
		</div>
	);
};

interface LoginFormData {
	email: string;
	password: string;
}

export default Login;
