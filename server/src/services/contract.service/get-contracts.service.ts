import { Contract } from "../../models/contract.model";

export const getContractsService = async (employeeId?: string) => {
  const query = employeeId ? { employeeId } : {};
  return Contract.find(query)
    .populate("employeeId", "firstName lastName")
    .populate("departmentId", "name")
    .populate("jobPositionId", "title")
    .populate("salaryStructureId", "name")
    .sort({ startDate: -1 }); // Newest first
};
