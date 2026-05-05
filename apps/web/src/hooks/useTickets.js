import { useCallback } from 'react';
import { useApi, useMutation } from './useApi.js';
import { ticketsApi } from '@/lib/api.js';

export function useTickets(filters = {}) {
  const { data, loading, error, refetch } = useApi(
    () => ticketsApi.list(filters),
    [filters.search, filters.status, filters.urgencia]
  );

  const { mutate: createTicket, loading: creating } = useMutation(ticketsApi.create);
  const { mutate: updateTicket, loading: updating } = useMutation(
    (id, data) => ticketsApi.update(id, data)
  );
  const { mutate: updateStatus, loading: updatingStatus } = useMutation(
    (id, status, urgencia) => ticketsApi.updateStatus(id, status, urgencia)
  );
  const { mutate: deleteTicket, loading: deleting } = useMutation(ticketsApi.delete);

  return {
    tickets: data?.tickets || [],
    count: data?.count || 0,
    loading,
    error,
    refetch,
    createTicket,
    updateTicket,
    updateStatus,
    deleteTicket,
    creating,
    updating,
    updatingStatus,
    deleting,
  };
}
