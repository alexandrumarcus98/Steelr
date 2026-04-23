import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import "@components/login/login.scss";

interface RegisterFormData {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

const Register: React.FC = () => {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>();

	const password = watch("password", "");

	const onSubmit = async (data: RegisterFormData) => {
		try {
			const response = await axios.post("/api/auth/register", {
				name: data.name,
				email: data.email,
				password: data.password,
			});
			console.log("Registration successful:", response.data);
		} catch (error: any) {
			console.error(
				"Registration failed:",
				error.response?.data?.message || error.message,
			);
		}
	};

	return (
		<div className="login-page">
			<section className="login-card" aria-labelledby="register-title">
				<div className="login-logo" aria-hidden="true">
					RG
				</div>
				<h1 id="register-title">Create your account</h1>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="login-form"
					noValidate
				>
					<div className="form-group">
						<label htmlFor="name">Full name</label>
						<input
							type="text"
							id="name"
							placeholder="John Doe"
							{...register("name", {
								required: "Name is required",
								minLength: {
									value: 2,
									message: "Name must be at least 2 characters",
								},
							})}
						/>
						{errors.name && <p className="error-text">{errors.name.message}</p>}
					</div>

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
						<label htmlFor="password">Password</label>
						<input
							type="password"
							id="password"
							placeholder="Create a password"
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

					<div className="form-group">
						<label htmlFor="confirmPassword">Confirm password</label>
						<input
							type="password"
							id="confirmPassword"
							placeholder="Repeat your password"
							{...register("confirmPassword", {
								required: "Please confirm your password",
								validate: (value) =>
									value === password || "Passwords do not match",
							})}
						/>
						{errors.confirmPassword && (
							<p className="error-text">{errors.confirmPassword.message}</p>
						)}
					</div>

					<button type="submit" className="submit-btn" disabled={isSubmitting}>
						{isSubmitting ? "Creating account..." : "Create account"}
					</button>
				</form>

				<p className="signup-copy">
					Already have an account? <Link to="/login">Sign in</Link>
				</p>
			</section>
		</div>
	);
};

export default Register;
