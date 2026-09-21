import { apiClient } from './client';

// GET /user/:id/reviews
export async function fetchUserReviewsRequest(id) {
  const { data } = await apiClient.get(`/user/${id}/reviews`);
  return data.data;
}

// POST /user/:id/reviews
export async function createReviewRequest(id, reviewdata) {
  const { data } = await apiClient.post(`/user/${id}/reviews`, reviewdata)
  return data.data.createdReview;
}

// PUT /user/:id/reviews/:reviewid — AuthenticateToken
export async function updateReviewRequest(id, reviewid, updates) {
  const { data } = await apiClient.put(`/user/${id}/reviews/${reviewid}`, updates)
  return data.data;
}

// DELETE /user/:id/reviews/:reviewid — AuthenticateToken
export async function deleteReviewRequest(id, reviewid) {
  const { data } = await apiClient.delete(`/user/${id}/reviews/${reviewid}`);
  return data.data;
}