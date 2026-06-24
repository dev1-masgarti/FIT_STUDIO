import { backendFetch, getSessionToken } from '@/lib/backend/client';

type SendEncryptedMessageInput = {
  conversationId: string;
  senderUserId: string;
  senderDeviceId: string;
  recipientUserId: string;
  ciphertext: string;
  nonce: string;
  keyVersion: number;
  idempotencyKey: string;
};

export const sendEncryptedMessage = async (
  input: SendEncryptedMessageInput,
): Promise<void> => {
  const token = await getSessionToken();
  await backendFetch('/chat/messages/send', {
    method: 'POST',
    token,
    body: {
      conversation_id: input.conversationId,
      sender_user_id: input.senderUserId,
      sender_device_id: input.senderDeviceId,
      recipient_user_id: input.recipientUserId,
      payload_ciphertext: input.ciphertext,
      payload_nonce: input.nonce,
      key_version: input.keyVersion,
      idempotency_key: input.idempotencyKey,
    },
  });
};

export const listEncryptedMessages = async (
  conversationId: string,
): Promise<
  Array<{
    id: string;
    sender_user_id: string;
    recipient_user_id: string;
    payload_ciphertext: string;
    payload_nonce: string;
    key_version: number;
    created_at: string;
  }>
> => {
  const token = await getSessionToken();
  const response = await backendFetch<{ items: Array<{
    id: string;
    senderUserId: string;
    recipientUserId: string;
    payloadCiphertext: string;
    payloadNonce: string;
    keyVersion: number;
    createdAt: string;
  }> }>(`/chat/messages/${encodeURIComponent(conversationId)}`, { token });

  return response.items.map((item) => ({
    id: item.id,
    sender_user_id: item.senderUserId,
    recipient_user_id: item.recipientUserId,
    payload_ciphertext: item.payloadCiphertext,
    payload_nonce: item.payloadNonce,
    key_version: item.keyVersion,
    created_at: item.createdAt,
  }));
};

export const markMessageReceipt = async (
  messageId: string,
  recipientUserId: string,
  recipientDeviceId: string | null,
  status: 'delivered' | 'read',
): Promise<void> => {
  const token = await getSessionToken();
  await backendFetch(`/chat/messages/${encodeURIComponent(messageId)}/receipt`, {
    method: 'POST',
    token,
    body: {
      recipient_user_id: recipientUserId,
      recipient_device_id: recipientDeviceId,
      status,
    },
  });
};
