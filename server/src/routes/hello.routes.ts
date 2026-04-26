import { Router, Request, Response } from "express";

const helloRouter = Router();

helloRouter.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Hello from the server!" });
});

export default helloRouter;
