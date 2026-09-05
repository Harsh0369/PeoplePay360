import { SalaryRule } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getSalaryRulesService = async (pagination: PaginationParams) => {
  const { page, limit, skip } = pagination;

  const [data, totalItems] = await Promise.all([
    SalaryRule.find()
      .sort({ sequence: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SalaryRule.countDocuments()
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
