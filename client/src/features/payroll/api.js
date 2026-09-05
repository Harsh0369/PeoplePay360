import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeResource } from '../../lib/resource.js';
import { apiRequest } from '../../lib/api.js';

// Payroll is mock-backed end to end: the backend has no /payruns or /payslips
// yet, so employees/structures here must come from the mock too, otherwise
// payslips would reference ids that the real employee list doesn't contain.
const MOCK = { forceMock: true };

export const {
  useList: usePayruns, useOne: usePayrun, useSave: useSavePayrun,
} = makeResource('payruns', MOCK);

export const { useList: usePayslips } = makeResource('payslips', MOCK);
export const { useList: useStructures } = makeResource('salaryStructures', MOCK);
export const { useList: useEmployees } = makeResource('employees', MOCK);

// Payrun lifecycle actions -> POST /payruns/:id/<action>
function usePayrunAction(action) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiRequest('post', `/payruns/${id}/${action}`, null, MOCK),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payruns', 'mock'] });
      qc.invalidateQueries({ queryKey: ['payslips', 'mock'] });
    },
  });
}

export const useComputePayrun = () => usePayrunAction('compute');
export const useValidatePayrun = () => usePayrunAction('validate');
export const useMarkPaidPayrun = () => usePayrunAction('markpaid');
export const useSendPayslips = () => usePayrunAction('send');
