import { SalaryStructure } from "../../models";
import { PaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getSalaryStructuresService = async (pagination: PaginationParams) => {
  const { page, limit, skip } = pagination;

  const [data, totalItems] = await Promise.all([
    SalaryStructure.find()
      .populate("ruleIds")
      .skip(skip)
      .limit(limit)
      .lean(),
    SalaryStructure.countDocuments()
  ]);

  return {
    data,
    offsetPagination: buildOffsetPagination(totalItems, page, limit),
  };
};
