import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { normalizeApiError } from "@/lib/apiError";

import { type RegisterFormData, registerSchema } from "@/components/auth/validation";

const Register: React.FC = () => {
	const { register: registerUser } = useAuth();
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
	});

	const { error } = useToast();

	const onSubmit = async (data: RegisterFormData) => {
		try {
			await registerUser({
				username: data.username,
				email: data.email,
				password: data.password,
			});
			navigate("/dashboard");
		} catch (err) {
			const { message } = normalizeApiError(err, "Registration failed. Please try again.");
			error(message);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-xl flex-col items-center py-12">
			<div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center">
				<h1
					id="register-title"
					className="font-display w-full text-center text-4xl font-semibold tracking-tight text-text sm:text-6xl"
				>
					Create your account
				</h1>

				<form onSubmit={handleSubmit(onSubmit)} className="mt-10 w-full space-y-4" noValidate>
					<div>
						<label htmlFor="username" className="mb-1.5 block text-sm font-medium text-text">
							Username
						</label>
						<input
							type="text"
							id="username"
							placeholder="johndoe"
							className="w-full rounded-xl border border-border-soft bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-all duration-200 placeholder:text-muted focus:border-accent
focus:ring-2 focus:ring-accent/15"
							{...register("username")}
						/>
						{errors.username && (
							<p className="mt-1.5 text-xs text-accent">{errors.username.message}</p>
						)}
					</div>

					<div>
						<label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
							Email address
						</label>
						<input
							type="email"
							id="email"
							placeholder="name@company.com"
							className="w-full rounded-xl border border-border-soft bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-all duration-200 placeholder:text-muted focus:border-accent
focus:ring-2 focus:ring-accent/15"
							{...register("email")}
						/>
						{errors.email && <p className="mt-1.5 text-xs text-accent">{errors.email.message}</p>}
					</div>

					<div>
						<label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text">
							Password
						</label>
						<input
							type="password"
							id="password"
							placeholder="Create a password"
							className="w-full rounded-xl border border-border-soft bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-all duration-200 placeholder:text-muted focus:border-accent
focus:ring-2 focus:ring-accent/15"
							{...register("password")}
						/>
						{errors.password && (
							<p className="mt-1.5 text-xs text-accent">{errors.password.message}</p>
						)}
					</div>

					<div>
						<label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-text">
							Confirm password
						</label>
						<input
							type="password"
							id="confirmPassword"
							placeholder="Repeat your password"
							className="w-full rounded-xl border border-border-soft bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-all duration-200 placeholder:text-muted focus:border-accent
focus:ring-2 focus:ring-accent/15"
							{...register("confirmPassword")}
						/>
						{errors.confirmPassword && (
							<p className="mt-1.5 text-xs text-accent">{errors.confirmPassword.message}</p>
						)}
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-text transition-all duration-200 hover:-translate-y-px
disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isSubmitting ? "Creating account..." : "Create account"}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-muted">
					Already have an account?{" "}
					<Link
						to="/login"
						state={{ from: "/register" }}
						className="font-medium transition-colors duration-200 text-faint hover:text-text"
						onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
						onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Register;
