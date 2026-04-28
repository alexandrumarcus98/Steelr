import type { Request, RequestHandler } from "express";
import type { UserRole } from "@/models";

const hasRole = (userRoles: UserRole[], requiredRoles: UserRole[]): boolean => {
  return requiredRoles.some((role) => userRoles.includes(role));
};

export const requireRoles = (...requiredRoles: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!hasRole(req.user.roles, requiredRoles)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
};

export const requireVerifiedUser: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (!req.user.isVerified) {
    res.status(403).json({ message: "Account verification required" });
    return;
  }

  next();
};

export interface RequireOwnershipOptions {
  bypassRoles?: UserRole[];
}

export const requireOwnership = (
  getOwnerId: (req: Request) => string | undefined,
  options: RequireOwnershipOptions = {}
): RequestHandler => {
  const bypassRoles = options.bypassRoles ?? ["admin", "moderator"];

  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const ownerId = getOwnerId(req);

    if (!ownerId) {
      res.status(400).json({ message: "Unable to resolve resource owner" });
      return;
    }

    if (req.user.id === ownerId || hasRole(req.user.roles, bypassRoles)) {
      next();
      return;
    }

    res.status(403).json({ message: "Forbidden" });
  };
};
