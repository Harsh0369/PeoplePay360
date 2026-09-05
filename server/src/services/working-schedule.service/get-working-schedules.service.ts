import { WorkingSchedule } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getWorkingSchedulesService = async (pagination: PaginationParams) => {
  const { page, limit, skip } = pagination;

  const [data, totalItems] = await Promise.all([
    WorkingSchedule.find()
      .skip(skip)
      .limit(limit)
      .lean(),
    WorkingSchedule.countDocuments()
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
