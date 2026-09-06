import { User } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";
import { smartCount } from "../../utils/db.util";

export const getUsersService = async (pagination: PaginationParams) => {
  const { page, limit, skip } = pagination;
  
  const [data, totalItems] = await Promise.all([
    User.find()
      .populate("employeeId", "name empCode workEmail")
      .populate("roleId", "name isSystem isAdmin")
      .skip(skip)
      .limit(limit)
      .lean(),
    smartCount(User)
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
