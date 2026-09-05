import { makeResource } from '../../lib/resource.js';

export const {
  useList: useRequests, useSave: useSaveRequest, useRemove: useDeleteRequest,
} = makeResource('timeOffRequests');

export const {
  useList: useAllocations, useSave: useSaveAllocation, useRemove: useDeleteAllocation,
} = makeResource('allocations');

export const {
  useList: useTypes, useSave: useSaveType, useRemove: useDeleteType,
} = makeResource('timeOffTypes');

export const { useList: useEmployees } = makeResource('employees');
