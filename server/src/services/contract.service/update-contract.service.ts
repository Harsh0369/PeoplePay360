import { Contract } from "../../models/contract.model";
import { NotFoundError, ValidationError } from "../../errors";
import { Types } from "mongoose";

export interface UpdateContractDto {
  status?: "Draft" | "Running" | "Expired" | "Cancelled";
  endDate?: string | null;
}

export const updateContractService = async (id: string, data: UpdateContractDto) => {
  const contract = await Contract.findById(id);
  if (!contract) {
    throw new NotFoundError("Contract not found");
  }

  if (data.endDate !== undefined) {
    if (data.endDate) {
      const newEndDate = new Date(data.endDate);
      if (newEndDate <= contract.startDate) {
        throw new ValidationError("End date must be after start date");
      }
      contract.endDate = newEndDate;
    } else {
      contract.endDate = null;
    }
  }

  if (data.status && data.status !== contract.status) {
    // If transitioning to 'Running', perform the overlap check again
    if (data.status === "Running") {
      const allRunning = await Contract.find({
        employeeId: contract.employeeId,
        status: "Running",
        _id: { $ne: contract._id }
      });

      const start = contract.startDate;
      const end = contract.endDate || new Date("9999-12-31");

      for (const c of allRunning) {
        const cStart = c.startDate;
        const cEnd = c.endDate || new Date("9999-12-31");
        
        if (start <= cEnd && end >= cStart) {
          throw new ValidationError("Cannot activate: Employee already has an overlapping Running contract");
        }
      }
    }
    contract.status = data.status;
  }

  await contract.save();
  return contract;
};
