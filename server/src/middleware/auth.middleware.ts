import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UserModel, type UserRole } from "@/models";
import type { AuthUser } from "@/types/auth";

interface AccessTokenPayload extends JwtPayload {
	sub: string;
	roles?: UserRole[];
}

const extractBearerToken = (authorizationHeader?: string): string | null => {
	if (!authorizationHeader) {
		return null;
	}

	const [scheme, token] = authorizationHeader.split(" ");

	if (scheme !== "Bearer" || !token) {
		return null;
	}

	return token;
};

const getAccessTokenSecret = (): string => {
	const secret = process.env.JWT_ACCESS_SECRET;

	if (!secret) {
		throw new Error("Missing JWT_ACCESS_SECRET environment variable");
	}

	return secret;
};

const isAccessTokenPayload = (payload: string | JwtPayload): payload is AccessTokenPayload => {
	if (typeof payload === "string") {
		return false;
	}

	return typeof payload.sub === "string";
};

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const token = extractBearerToken(req.headers.authorization);

		if (!token) {
			res.status(401).json({ message: "Missing or invalid authorization header" });
			return;
		}

		const decoded = jwt.verify(token, getAccessTokenSecret());

		if (!isAccessTokenPayload(decoded)) {
			res.status(401).json({ message: "Invalid token payload" });
			return;
		}

		const user = await UserModel.findById(decoded.sub)
			.select("roles isActive isVerified")
			.exec();

		if (!user || !user.isActive) {
			res.status(401).json({ message: "User is not authorized" });
			return;
		}

		const authUser: AuthUser = {
			id: user.id,
			roles: user.roles as UserRole[],
			isVerified: user.isVerified,
		};

		req.user = authUser;
		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			res.status(401).json({ message: "Access token expired" });
			return;
		}

		if (error instanceof jwt.JsonWebTokenError) {
			res.status(401).json({ message: "Invalid access token" });
			return;
		}

		next(error);
	}
};
