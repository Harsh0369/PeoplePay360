import { makeResource } from '../../lib/resource.js';

export const {
  useList: useSchedules,
  useSave: useSaveSchedule,
  useRemove: useDeleteSchedule,
} = makeResource('schedules');
