import { useState, useCallback } from 'react';
import { useApi, useMutation } from './useApi.js';
import { whatsappApi } from '@/lib/api.js';

export function useWhatsAppConversations() {
  const { data, loading, error, refetch } = useApi(() => whatsappApi.listConversations());

  return {
    conversations: data?.conversations || [],
    loading,
    error,
    refetch,
  };
}

export function useWhatsAppMessages(conversationId) {
  const { data, loading, error, refetch } = useApi(
    () => conversationId ? whatsappApi.getMessages(conversationId) : Promise.resolve({ messages: [] }),
    [conversationId]
  );

  const { mutate: sendMessage, loading: sending } = useMutation(
    (text) => whatsappApi.sendMessage(conversationId, text)
  );

  return {
    messages: data?.messages || [],
    loading,
    error,
    refetch,
    sendMessage,
    sending,
  };
}

export function useWhatsAppInstances() {
  const { data, loading, error, refetch } = useApi(() => whatsappApi.listInstances());

  const { mutate: createInstance, loading: creating } = useMutation(whatsappApi.createInstance);
  const { mutate: deleteInstance, loading: deleting } = useMutation(whatsappApi.deleteInstance);

  return {
    instances: data?.instances || [],
    loading,
    error,
    refetch,
    createInstance,
    deleteInstance,
    creating,
    deleting,
  };
}
