import type { Request, Response } from "express";
import * as helloService from "@/services/hello.service";

export const getHello = (_req: Request, res: Response) => {
  res.json(helloService.getHelloMessage());
};
