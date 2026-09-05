import { JobPosition, Department } from "../../models";

export const getJobPositionsService = async () => {
  let positions = await JobPosition.find().populate("departmentId");
  if (!positions || positions.length === 0) {
    try {
      const eng = await Department.findOne({ name: "Engineering" });
      const hr = await Department.findOne({ name: "Human Resources" });
      const fin = await Department.findOne({ name: "Finance & Payroll" });

      await JobPosition.insertMany([
        { title: "Senior Software Engineer", departmentId: eng?._id, expectedSalary: 8500 },
        { title: "HR Specialist", departmentId: hr?._id, expectedSalary: 5900 },
        { title: "Payroll Coordinator", departmentId: fin?._id, expectedSalary: 6200 },
        { title: "Product Designer", departmentId: eng?._id, expectedSalary: 5400 },
        { title: "DevOps Lead", departmentId: eng?._id, expectedSalary: 9200 }
      ]);
      positions = await JobPosition.find().populate("departmentId");
    } catch {
      // Ignore duplicate race conditions
    }
  }
  return positions;
};
