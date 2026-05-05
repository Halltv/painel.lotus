import { useState, useCallback } from 'react';
import { useApi, useMutation } from './useApi.js';
import { clientsApi } from '@/lib/api.js';

export function useClients(search = '') {
  const { data, loading, error, refetch } = useApi(
    () => clientsApi.list(search),
    [search]
  );

  const { mutate: createClient, loading: creating } = useMutation(clientsApi.create);
  const { mutate: updateClient, loading: updating } = useMutation(
    (id, data) => clientsApi.update(id, data)
  );
  const { mutate: deleteClient, loading: deleting } = useMutation(clientsApi.delete);

  return {
    clients: data?.clients || [],
    count: data?.count || 0,
    loading,
    error,
    refetch,
    createClient,
    updateClient,
    deleteClient,
    creating,
    updating,
    deleting,
  };
}
