import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { updateEmployeePermissionsService } from "../../services/employee.service/update-employee-permissions.service";
import { z } from "zod";
import { ValidationError } from "../../errors";

const updatePermissionsSchema = z.object({
  permissions: z.record(z.boolean())
});

export const updateEmployeePermissionsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employeeId = req.params.id;
  const parseResult = updatePermissionsSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    throw new ValidationError("Invalid permissions format");
  }

  const result = await updateEmployeePermissionsService({
    employeeId,
    permissions: parseResult.data.permissions
  });

  return ResponseUtil.success(res, "Employee permissions updated successfully", result);
});
