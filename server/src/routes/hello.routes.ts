import { Router } from "express";
import { getHello } from "@/controllers/hello.controller";

const helloRouter = Router();

helloRouter.get("/", getHello);

export default helloRouter;
