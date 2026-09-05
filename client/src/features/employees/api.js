import { makeResource } from '../../lib/resource.js';

// All employee data hooks in one line — the pattern every module copies.
export const {
  useList: useEmployees,
  useOne: useEmployee,
  useSave: useSaveEmployee,
  useRemove: useDeleteEmployee,
} = makeResource('employees');

// Related resources (used for smart-button counts on the employee form).
export const { useList: useContracts } = makeResource('contracts');
export const { useList: useSchedules } = makeResource('schedules');
