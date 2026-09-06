import { Request, Response } from "express";
import { getAllEmployeesService } from "../../services/employee.service/get-all-employees.service";
import { ResponseUtil } from "../../utils/response.util";
import { getPaginationParams } from "../../utils/pagination.util";

export const getAllEmployeesController = async (req: Request, res: Response) => {
  try {
    const pagination = getPaginationParams(req);
    const filters = {
      search: (req.query.search as string) || "",
      departmentId: req.query.departmentId as string | undefined,
      jobPositionId: req.query.jobPositionId as string | undefined,
      status: req.query.status as string | undefined,
      employeeType: req.query.employeeType as string | undefined,
    };
    const { data, offsetPagination } = await getAllEmployeesService(pagination, filters);

    return ResponseUtil.paginatedOffset(res, "Employees fetched successfully", data, offsetPagination);
  } catch (error: any) {
    return ResponseUtil.error(res, error.message, 500);
  }
};
