import { Contract } from "../models/contract.model";

export const getContractsService = async () => {
  return await Contract.find().populate("employeeId departmentId jobPositionId workingScheduleId");
};

export const createContractService = async (data: any) => {
  const contract = await Contract.create(data);
  return contract;
};

export const updateContractService = async (id: string, data: any) => {
  const contract = await Contract.findByIdAndUpdate(id, data, { new: true });
  return contract;
};
