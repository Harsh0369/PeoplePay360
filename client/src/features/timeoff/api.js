import { makeResource } from '../../lib/resource.js';

// The backend exposes only POST actions for time-off (no list endpoints), so this
// module stays mock-backed — including its employee lookup, so names resolve.
const MOCK = { forceMock: true };

export const {
  useList: useRequests, useSave: useSaveRequest, useRemove: useDeleteRequest,
} = makeResource('timeOffRequests', MOCK);

export const {
  useList: useAllocations, useSave: useSaveAllocation, useRemove: useDeleteAllocation,
} = makeResource('allocations', MOCK);

export const {
  useList: useTypes, useSave: useSaveType, useRemove: useDeleteType,
} = makeResource('timeOffTypes', MOCK);

export const { useList: useEmployees } = makeResource('employees', MOCK);
