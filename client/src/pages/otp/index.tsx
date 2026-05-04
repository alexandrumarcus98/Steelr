import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";

import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/providers/auth";
import { useAppSelector } from "@/store/hooks";

import "./otp.scss";

const OTP: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [otp, setOtp] = useState("");
	const [timeLeft, setTimeLeft] = useState(0);
	const [isResending, setIsResending] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { verifyOTP, generateOTP } = useAuth();
	const tempEmail = useAppSelector((state) => state.auth.tempEmail);
	const { success, error } = useToast();

	const emailFromState =
		(location.state as { email?: string } | null)?.email || tempEmail;

	// Calculate time left based on expiresAt from location state
	useEffect(() => {
		const expiresAtString = (location.state as { expiresAt?: string } | null)
			?.expiresAt;

		if (!expiresAtString) {
			setTimeLeft(0);
			return;
		}

		const expiresAt = new Date(expiresAtString).getTime();

		// Calculate initial time left
		const updateTimeLeft = () => {
			const now = new Date().getTime();
			const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
			setTimeLeft(remaining);
		};

		// Update immediately
		updateTimeLeft();

		// Then update every second
		const timer = setInterval(updateTimeLeft, 1000);

		return () => clearInterval(timer);
	}, [location.state]);

	useEffect(() => {
		// If no email in state, redirect to login
		if (!emailFromState) {
			navigate("/login");
		}
	}, [emailFromState, navigate]);

	// Don't render anything if no email (will redirect)
	if (!emailFromState) {
		return null;
	}

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (otp.length !== 6) {
			error("Invalid OTP", "Please enter a 6-digit OTP");
			return;
		}

		try {
			setIsSubmitting(true);
			await verifyOTP(emailFromState, otp);
			success("OTP verified successfully");
			navigate("/dashboard", { replace: true });
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to verify OTP. Please try again.";
			error("Invalid OTP", errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleResendOTP = async () => {
		try {
			setIsResending(true);
			const result = await generateOTP(emailFromState);
			success("New OTP sent successfully");
			setOtp(""); // Clear OTP input
			// Update timeLeft with new expiration time
			if (result?.expiresAt) {
				const expiresAt = new Date(result.expiresAt).getTime();
				const now = new Date().getTime();
				setTimeLeft(Math.floor((expiresAt - now) / 1000));
			}
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to resend OTP";
			error("Resend failed", errorMessage);
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 sm:p-10">
			<div className="mx-auto mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-xs font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5">
				OTP
			</div>
			<h1 className="text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
				Enter OTP
			</h1>
			<p className="mt-2 text-center text-sm text-gray-600">
				We've sent a 6-digit code to {emailFromState}
			</p>

			<form onSubmit={onSubmit} className="mt-7 space-y-6" noValidate>
				<div>
					<label className="mb-4 block text-sm font-medium text-gray-700">
						6-digit OTP
					</label>
					<div className="flex justify-center">
						<div className="otp-container">
							<OtpInput
								value={otp}
								onChange={setOtp}
								numInputs={6}
								containerStyle="otp-container"
								renderSeparator={<span>-</span>}
								renderInput={(props) => (
									<input {...props} className="otp-input" />
								)}
							/>
						</div>
					</div>
				</div>

				<button
					type="submit"
					disabled={isSubmitting || otp.length !== 6}
					className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isSubmitting ? "Verifying OTP..." : "Verify OTP"}
				</button>

				<div className="text-center">
					<button
						type="button"
						onClick={handleResendOTP}
						disabled={timeLeft > 0 || isResending}
						className="text-xs font-medium text-gray-600 transition-all duration-300 hover:text-gray-900 disabled:opacity-50"
					>
						{isResending
							? "Sending..."
							: timeLeft > 0
								? `Resend in ${timeLeft}s`
								: "Resend OTP"}
					</button>
				</div>
			</form>

			<p className="mt-6 text-center text-sm text-gray-600">
				Wrong email?{" "}
				<button
					type="button"
					onClick={() => navigate("/login")}
					className="font-medium text-gray-900 transition-all duration-300 hover:opacity-70"
				>
					Back to login
				</button>
			</p>
		</div>
	);
};

export default OTP;
