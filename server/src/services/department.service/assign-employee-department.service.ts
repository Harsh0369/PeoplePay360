import { Employee, Department, BusinessLog } from "../../models";
import { NotFoundError } from "../../errors";

export const assignEmployeeDepartmentService = async (
  employeeId: string,
  departmentId: string,
  adminUserId: string
) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  const department = await Department.findById(departmentId);
  if (!department) {
    throw new NotFoundError("Department not found");
  }

  const oldDeptId = employee.departmentId;
  
  employee.departmentId = department._id;
  await employee.save();

  // Non-blocking business log
  setImmediate(async () => {
    try {
      await BusinessLog.create({
        entity: "EMPLOYEE",
        action: "UPDATE",
        content: `Assigned to department: ${department.name} (was: ${oldDeptId || 'None'})`,
        performedBy: adminUserId,
      });
    } catch (err) {
      console.error("Failed to write business log for department assignment:", err);
    }
  });

  return employee;
};
