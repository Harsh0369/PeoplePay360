import { User } from "../../models/user.model";
import { PaginationOptions } from "../../types/pagination.type";

export const getJoinRequestsService = async (options: PaginationOptions) => {
  const { page = 1, limit = 15 } = options;
  const skip = (page - 1) * limit;

  // Join requests are users that do not have an employeeId attached
  const query = { employeeId: { $exists: false } };

  const [users, totalItems] = await Promise.all([
    User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    items: users,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      pageSize: limit,
    },
  };
};
