import { makeResource } from '../../lib/resource.js';

export const {
  useList: useContracts,
  useOne: useContract,
  useSave: useSaveContract,
  useRemove: useDeleteContract,
} = makeResource('contracts');

// Lookups for form selects.
export const { useList: useEmployees } = makeResource('employees');
export const { useList: useSchedules } = makeResource('schedules');
export const { useList: useStructures } = makeResource('salaryStructures');
