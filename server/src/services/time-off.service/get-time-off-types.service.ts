import { TimeOffType } from "../../models";

export const getTimeOffTypesService = async () => {
  return TimeOffType.find().sort({ name: 1 });
};
