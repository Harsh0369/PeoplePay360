import { makeResource } from '../../lib/resource.js';

// The backend exposes only POST /attendance/clock-in|clock-out (no list endpoint),
// so this module stays mock-backed — including its employee lookup, so names resolve.
const MOCK = { forceMock: true };

export const {
  useList: useAttendance,
  useSave: useSaveAttendance,
  useRemove: useDeleteAttendance,
} = makeResource('attendance', MOCK);

export const { useList: useEmployees } = makeResource('employees', MOCK);
