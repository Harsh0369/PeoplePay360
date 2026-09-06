import { Employee } from "../../models/employee.model";
import { User } from "../../models/user.model";
import { NotFoundError } from "../../errors/index";
import { createBusinessLog } from "../business-log.service";

export const deleteEmployeeService = async (id: string, actorId: string) => {
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  if (employee.userId) {
    await User.findByIdAndDelete(employee.userId);
  }

  createBusinessLog({
    actorId,
    affectedEmployeeId: employee._id as any,
    action: "DELETE",
    entity: "EMPLOYEE",
    content: `Fired/Deleted employee ${employee.name} (${employee.workEmail})`,
  });

  return { id };
};
