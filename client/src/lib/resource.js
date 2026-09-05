import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api.js';

/**
 * Builds a standard set of React Query hooks for a REST resource.
 * Every module gets consistent list/detail/save/delete behavior for free:
 *
 *   const { useList, useOne, useSave, useRemove } = makeResource('employees');
 *
 * Save handles both create (no id) and update (has _id). All hooks invalidate
 * the list cache so screens refresh automatically after a change.
 */
export function makeResource(resource) {
  const key = [resource];

  const useList = (params) =>
    useQuery({
      queryKey: params ? [resource, params] : key,
      queryFn: () => apiRequest('get', `/${resource}`),
    });

  const useOne = (id) =>
    useQuery({
      queryKey: [resource, id],
      queryFn: () => apiRequest('get', `/${resource}/${id}`),
      enabled: !!id,
    });

  const useSave = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (doc) =>
        doc._id
          ? apiRequest('put', `/${resource}/${doc._id}`, doc)
          : apiRequest('post', `/${resource}`, doc),
      onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    });
  };

  const useRemove = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id) => apiRequest('delete', `/${resource}/${id}`),
      onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    });
  };

  return { useList, useOne, useSave, useRemove };
}
