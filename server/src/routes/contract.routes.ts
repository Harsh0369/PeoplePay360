import { Router } from "express";
import { getContractsController, createContractController, updateContractController } from "../controllers/contract.controller";

const router = Router();

router.get("/", getContractsController);
router.post("/", createContractController);
router.put("/:id", updateContractController);

export default router;
