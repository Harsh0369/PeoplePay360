import { Employee } from "../../models/employee.model";
import { User } from "../../models/user.model";
import { NotFoundError } from "../../errors";

interface UpdateEmployeePermissionsParams {
  employeeId: string;
  permissions: Record<string, boolean>;
}

export const updateEmployeePermissionsService = async (params: UpdateEmployeePermissionsParams) => {
  const { employeeId, permissions } = params;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  // The permissions reside on the User model since that's what's used during auth
  const user = await User.findOne({ employeeId: employee._id });
  if (!user) {
    throw new NotFoundError("Associated user not found for this employee");
  }

  // Merge the new permissions with existing customPermissions
  const updatedPermissions = {
    ...(user.customPermissions || {}),
    ...permissions
  };

  user.customPermissions = updatedPermissions;
  
  // Mark it as modified since it's an Object type in mongoose
  user.markModified("customPermissions");
  
  await user.save();

  return user.customPermissions;
};
