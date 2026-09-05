import { Request, Response } from "express";
import { getContractsService, createContractService, updateContractService } from "../services/contract.service";
import { ResponseUtil } from "../utils/response.util";
import { catchAsync } from "../utils/catch-async.util";

export const getContractsController = catchAsync(async (req: Request, res: Response) => {
  const contracts = await getContractsService();
  return ResponseUtil.success(res, "Contracts retrieved successfully", contracts);
});

export const createContractController = catchAsync(async (req: Request, res: Response) => {
  const contract = await createContractService(req.body);
  return ResponseUtil.success(res, "Contract created successfully", contract, 201);
});

export const updateContractController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const contract = await updateContractService(id, req.body);
  return ResponseUtil.success(res, "Contract updated successfully", contract);
});
