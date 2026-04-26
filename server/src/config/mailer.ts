import nodemailer from "nodemailer";

const getFrontendUrl = (): string => {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("Missing FRONTEND_URL environment variable");
  }

  return frontendUrl.replace(/\/$/, "");
};

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
};

export const getPasswordResetUrl = (token: string): string => {
  return `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;
};

export const sendPasswordResetEmail = async (params: {
  to: string;
  username: string;
  resetUrl: string;
}): Promise<void> => {
  const transporter = createTransporter();
  const fromAddress = process.env.MAIL_FROM || "no-reply@steelr.local";
  const subject = "Reset your password";
  const text = [
    `Hello ${params.username},`,
    "",
    "We received a request to reset your password.",
    `Reset your password here: ${params.resetUrl}`,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  if (!transporter) {
    console.log("Password reset email fallback (no SMTP configured):");
    console.log({
      to: params.to,
      from: fromAddress,
      subject,
      text,
    });
    return;
  }

  await transporter.sendMail({
    from: fromAddress,
    to: params.to,
    subject,
    text,
    html: `
			<p>Hello ${params.username},</p>
			<p>We received a request to reset your password.</p>
			<p><a href="${params.resetUrl}">Click here to reset your password</a></p>
			<p>If you did not request this, you can ignore this email.</p>
		`,
  });
};
