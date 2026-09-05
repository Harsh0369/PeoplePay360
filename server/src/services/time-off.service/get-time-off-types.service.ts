import { TimeOffType } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getTimeOffTypesService = async (pagination: PaginationParams) => {
  const { page, limit, skip } = pagination;

  const [data, totalItems] = await Promise.all([
    TimeOffType.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TimeOffType.countDocuments()
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
