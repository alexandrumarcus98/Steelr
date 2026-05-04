import { z } from "zod";

const emailSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(1, "Email is required")
	.pipe(z.email({ message: "Please enter a valid email address" }));

const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Password must be at least 8 characters");

const usernameSchema = z
	.string()
	.transform((value) => value.replace(/\s+/g, " ").trim())
	.pipe(
		z
			.string()
			.min(2, "Username must be at least 2 characters")
			.max(100, "Username is too long"),
	);

export const loginSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});

export const recoverPasswordSchema = z.object({
	email: emailSchema,
});

export const resetPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z
			.string()
			.min(1, "Please confirm your password")
			.min(8, "Password must be at least 8 characters"),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.confirmPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Passwords do not match",
				path: ["confirmPassword"],
			});
		}
	});

export const registerSchema = z
	.object({
		username: usernameSchema,
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z
			.string()
			.min(1, "Please confirm your password")
			.min(8, "Password must be at least 8 characters"),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.confirmPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Passwords do not match",
				path: ["confirmPassword"],
			});
		}
	});

export const otpSchema = z.object({
	email: emailSchema,
	otp: z
		.string()
		.min(6, "OTP must be 6 characters")
		.max(6, "OTP must be 6 characters")
		.regex(/^[0-9]+$/, "OTP must contain only numbers"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
