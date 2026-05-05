import { useApi, useMutation } from './useApi.js';
import { usersApi } from '@/lib/api.js';

export function useUsers() {
  const { data, loading, error, refetch } = useApi(() => usersApi.list());

  const { mutate: createUser, loading: creating } = useMutation(usersApi.create);
  const { mutate: deleteUser, loading: deleting } = useMutation(usersApi.delete);
  const { mutate: updateProfile, loading: updating } = useMutation(
    (id, data) => usersApi.updateProfile(id, data)
  );

  return {
    users: data?.users || [],
    loading,
    error,
    refetch,
    createUser,
    deleteUser,
    updateProfile,
    creating,
    deleting,
    updating,
  };
}
