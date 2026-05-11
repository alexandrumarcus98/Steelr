import { Router } from "express";
import { authenticate, requireOwnership, requireRoles } from "@/middleware";
import * as usersController from "@/controllers/users-controller/users.controller";

const usersRouter = Router();

usersRouter.get("/me", authenticate, usersController.me);
usersRouter.get("/search", authenticate, usersController.searchUsers);
usersRouter.post("/:id/friends", authenticate, usersController.addFriend);
usersRouter.delete("/:id/friends", authenticate, usersController.removeFriend);

usersRouter.get(
	"/",
	authenticate,
	requireRoles("admin", "moderator"),
	usersController.getUsers
);

usersRouter.get(
	"/:id",
	authenticate,
	requireOwnership((req) => req.params.id),
	usersController.getUser
);

usersRouter.patch(
	"/:id",
	authenticate,
	requireOwnership((req) => req.params.id),
	usersController.updateUser
);

usersRouter.patch(
	"/:id/roles",
	authenticate,
	requireRoles("admin"),
	usersController.updateRoles
);

usersRouter.patch(
	"/:id/status",
	authenticate,
	requireRoles("admin"),
	usersController.updateStatus
);

usersRouter.delete(
	"/:id",
	authenticate,
	requireOwnership((req) => req.params.id, { bypassRoles: ["admin"] }),
	usersController.deleteUser
);

export default usersRouter;
