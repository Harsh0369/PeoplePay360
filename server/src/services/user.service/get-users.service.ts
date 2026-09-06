import { User } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getUsersService = async (pagination: PaginationParams) => {
  const { page, limit, skip } = pagination;
  
  const [data, totalItems] = await Promise.all([
    User.find()
      .populate("employeeId", "name empCode workEmail")
      .populate("roleId", "name isSystem")
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments()
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
