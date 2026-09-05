import { Employee } from "../../models/employee.model";
import { User } from "../../models/user.model";
import { ConflictError, NotFoundError } from "../../errors/index";
import { createBusinessLog } from "../business-log.service";

export const createEmployeeService = async (data: any, actorId?: string) => {
  const { userId, name, workEmail, workPhone, departmentId, jobPositionId, managerId, joinDate } = data;

  const existingEmployee = await Employee.findOne({ $or: [{ userId }, { workEmail }] });
  if (existingEmployee) {
    throw new ConflictError("Employee already exists with this userId or workEmail");
  }

  const employee = await Employee.create({
    userId,
    name,
    workEmail,
    workPhone,
    departmentId,
    jobPositionId,
    managerId,
    joinDate: joinDate || new Date(),
  });

  // Update the user record to link this employee
  await User.findByIdAndUpdate(userId, { employeeId: employee._id });

  if (actorId) {
    createBusinessLog({
      actorId,
      affectedEmployeeId: employee._id.toString(),
      action: "CREATE",
      entity: "EMPLOYEE",
      content: `Employee "${name}" created with email ${workEmail}`,
    });
  }

  return employee;
};
