import { Employee } from "../../models/employee.model";

export const getAllEmployeesService = async () => {
  return await Employee.find().populate("departmentId jobPositionId managerId");
};
