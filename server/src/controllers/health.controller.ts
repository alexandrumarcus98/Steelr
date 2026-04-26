import type { Request, Response } from "express";
import * as healthService from "@/services/health.service";

export const getHealth = (_req: Request, res: Response) => {
  res.status(200).json(healthService.getHealthStatus());
};
