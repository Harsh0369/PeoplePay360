import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { User } from "../../models/user.model";
import { NotFoundError } from "../../errors/index";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";

export const getMeController = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).populate("roleId");
  
  if (!user) {
    throw new NotFoundError("User not found");
  }

  return ResponseUtil.success(res, "User profile retrieved", {
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.roleId,
      employeeId: user.employeeId
    },
    permissions: Array.from(req.userPermissions || []),
    isAdmin: req.isAdmin,
    isSuperAdmin: req.isSuperAdmin,
    dataScope: req.dataScope
  });
});
