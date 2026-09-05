import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeResource } from '../../lib/resource.js';
import { apiRequest } from '../../lib/api.js';

export const {
  useList: usePayruns, useOne: usePayrun, useSave: useSavePayrun,
} = makeResource('payruns');

export const { useList: usePayslips } = makeResource('payslips');
export const { useList: useStructures } = makeResource('salaryStructures');
export const { useList: useEmployees } = makeResource('employees');

// Payrun lifecycle actions -> POST /payruns/:id/<action>
function usePayrunAction(action) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest('post', `/payruns/${id}/${action}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payruns'] });
      qc.invalidateQueries({ queryKey: ['payslips'] });
    },
  });
}

export const useComputePayrun = () => usePayrunAction('compute');
export const useValidatePayrun = () => usePayrunAction('validate');
export const useMarkPaidPayrun = () => usePayrunAction('markpaid');
export const useSendPayslips = () => usePayrunAction('send');
