import { apiClient } from './client';

export const createPayment = async (cartData) => {
  // Envoie les infos nécessaires (panier, items, ou montant selon ce qu'attend createTransaction)
  const response = await apiClient.post('/newPayment', cartData);
  return response.data; 
};

export const getTransactions = async () => {
  const response = await apiClient.get('/transactions');
  return response.data;
};

export const getTransactionById = async (id) => {
  const response = await apiClient.get(`/transactions/${id}`);
  return response.data;
};