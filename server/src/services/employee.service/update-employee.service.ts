import { Employee } from "../../models/employee.model";
import { NotFoundError } from "../../errors/index";

export const updateEmployeeService = async (id: string, data: any) => {
  const employee = await Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!employee) {
    throw new NotFoundError("Employee not found");
  }
  return employee;
};
