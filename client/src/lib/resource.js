import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api.js';

/**
 * Builds a standard set of React Query hooks for a REST resource.
 *
 *   const { useList, useOne, useSave, useRemove } = makeResource('employees');
 *
 * Pass { forceMock: true } for modules that must stay on the mock (e.g. payroll,
 * whose payruns/payslips reference mock employees and contracts).
 */
export function makeResource(resource, opts = {}) {
  const { forceMock = false } = opts;
  // Keep mock-backed caches separate from real ones for the same resource name.
  const key = forceMock ? [resource, 'mock'] : [resource];

  const useList = (params) =>
    useQuery({
      queryKey: params ? [...key, params] : key,
      queryFn: () => apiRequest('get', `/${resource}`, null, { forceMock }),
    });

  const useOne = (id) =>
    useQuery({
      queryKey: [...key, id],
      queryFn: () => apiRequest('get', `/${resource}/${id}`, null, { forceMock }),
      enabled: !!id,
    });

  const useSave = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (doc) =>
        doc._id
          ? apiRequest('put', `/${resource}/${doc._id}`, doc, { forceMock })
          : apiRequest('post', `/${resource}`, doc, { forceMock }),
      onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    });
  };

  const useRemove = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id) => apiRequest('delete', `/${resource}/${id}`, null, { forceMock }),
      onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    });
  };

  return { useList, useOne, useSave, useRemove };
}
