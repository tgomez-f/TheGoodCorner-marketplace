import { apiClient } from './client';

export async function fetchNotificationsRequest() {
  const { data } = await apiClient.get('/notifications');
  return data.data;
}

export async function markNotificationReadRequest(id) {
  const { data } = await apiClient.patch(`/notifications/${id}/read`);
  return data.data;
}

export async function markAllNotificationsReadRequest() {
  await apiClient.patch('/notifications/read-all');
}

export async function deleteNotificationRequest(id) {
  await apiClient.delete(`/notifications/${id}`);
}