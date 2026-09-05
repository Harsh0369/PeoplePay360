import { makeResource } from '../../lib/resource.js';

export const {
  useList: useAttendance,
  useSave: useSaveAttendance,
  useRemove: useDeleteAttendance,
} = makeResource('attendance');

export const { useList: useEmployees } = makeResource('employees');
