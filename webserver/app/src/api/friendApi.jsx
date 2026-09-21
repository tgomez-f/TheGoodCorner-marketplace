import { apiClient } from './client';

// POST /api/friend-requests — envoyer une demande d'amitié
export async function sendFriendRequestRequest(receiverId) {
  const { data } = await apiClient.post('/friend-requests', { receiverId });
  return data.data;
}

// GET /api/friend-requests?status=PENDING|ACCEPTED&type=received|sent
export async function fetchFriendRequestsRequest(filters = {}) {
  const { data } = await apiClient.get('/friend-requests', { params: filters });
  return data.data;
}

// PATCH /api/friend-requests/:id/accept — accepter une demande
export async function acceptFriendRequestRequest(id) {
  const { data } = await apiClient.patch(`/friend-requests/${id}/accept`);
  return data.data;
}

// PATCH /api/friend-requests/:id/reject — rejeter une demande
export async function rejectFriendRequestRequest(id) {
  const { data } = await apiClient.patch(`/friend-requests/${id}/reject`);
  return data.data;
}

// DELETE /api/friend-requests/:id — retirer un ami / annuler une demande
export async function deleteFriendRequestRequest(id) {
  await apiClient.delete(`/friend-requests/${id}`);
  return null; // 204 No Content
}

// GET /api/friends — récupérer tous les amis acceptés
export async function fetchFriendsRequest() {
  const { data } = await apiClient.get('/friends');
  return data
}