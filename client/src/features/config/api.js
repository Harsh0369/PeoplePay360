import { makeResource } from '../../lib/resource.js';

export const {
  useList: useStructures,
  useSave: useSaveStructure,
  useRemove: useDeleteStructure,
} = makeResource('salaryStructures');

export const {
  useList: useRules,
  useSave: useSaveRule,
  useRemove: useDeleteRule,
} = makeResource('salaryRules');
