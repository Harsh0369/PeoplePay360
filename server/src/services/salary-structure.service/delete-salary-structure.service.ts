import { SalaryStructure } from "../../models";
import { NotFoundError } from "../../errors";

export const deleteSalaryStructureService = async (id: string) => {
  const structure = await SalaryStructure.findByIdAndDelete(id);
  if (!structure) {
    throw new NotFoundError("Salary Structure not found");
  }
  return structure;
};
