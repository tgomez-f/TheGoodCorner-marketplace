import { create } from 'zustand';
import {
  sendFriendRequestRequest,
  acceptFriendRequestRequest,
  rejectFriendRequestRequest,
  deleteFriendRequestRequest,
  fetchFriendRequestsRequest,
  fetchFriendsRequest,
} from '../api/friendApi';

export const useFriendStore = create((set, get) => ({
  // Amitié : liste d'amis acceptés + demandes en attente. `friends` et
  // `friendRequests` (reçues) existaient déjà ; `sentFriendRequests` est
  // nouveau — sans lui impossible d'afficher "mes demandes envoyées",
  // /friend-requests/pending ne renvoyant que les demandes reçues.
  friends: [],
  friendRequests: [], // demandes REÇUES en attente (PENDING)
  sentFriendRequests: [], // demandes ENVOYÉES en attente (PENDING)
  onlineUserIds: {}, // status isOnline ?
  submitting: false,
  error: null,

  // POST /friend-requests — affecte TES demandes envoyées, pas les reçues.
  sendFriendRequest: async (receiverId) => {
    set({ submitting: true, error: null });
    try {
      const newRequest = await sendFriendRequestRequest(receiverId);
      if (newRequest?.status === 'ACCEPTED') {
        await Promise.all([get().fetchFriends(), get().fetchReceivedFriendRequests()]);
      } else {
        set((state) => ({ sentFriendRequests: [...state.sentFriendRequests, newRequest] }));
      }

      set({submitting: false});
      return newRequest;
    } catch (err) {
      set({ error: err.message, submitting: false });
      throw err;
    }
  },

  // PATCH .../accept — retire la demande de tes demandes reçues et ajoute
  // l'expéditeur à ta liste d'amis.
  acceptFriendRequest: async (id) => {
    set({ submitting: true, error: null });
    // Sauvegarder l'état précédent en cas d'erreur
    const previousRequests = get().friendRequests;
    
    try {
      // ← OPTIMISTIC : retirer la demande IMMÉDIATEMENT du store
      set((state) => ({
        friendRequests: state.friendRequests.filter((req) => req.id !== id),
      }));

      const accepted = await acceptFriendRequestRequest(id);
      // Refetch pour s'assurer que tout est cohérent
      const [receivedData, friendsData, acceptedData] = await Promise.all([
        fetchFriendRequestsRequest({ status: 'PENDING', type: 'received' }),
        fetchFriendsRequest(),
        fetchFriendRequestsRequest({ status: 'ACCEPTED' }),
      ]);      
      const acceptedRequests = acceptedData || [];
      const friends = (friendsData?.friends || []).map((friend) => {
        const match = acceptedRequests.find(
          (r) => r.sender?.id === friend.id || r.receiver?.id === friend.id
        );
        return { ...friend, friendRequestId: match?.id ?? null };
      });
      
      set({ friendRequests: receivedData || [], friends, submitting: false });
      return accepted;
    } catch (err) {
      // ← SI ERREUR : restaurer les demandes précédentes
      set({ friendRequests: previousRequests, error: err.message, submitting: false });
      throw err;
    }
  },

  // PATCH .../reject — retire la demande de tes demandes reçues.
  rejectFriendRequest: async (id) => {
    set({ submitting: true, error: null });
    const previousRequests = get().friendRequests;
    try {
      // ← OPTIMISTIC : retirer immédiatement
      set((state) => ({
        friendRequests: state.friendRequests.filter((req) => req.id !== id),
      }));
      
      const rejected = await rejectFriendRequestRequest(id);
      
      const receivedData = await fetchFriendRequestsRequest({ status: 'PENDING', type: 'received' });
      set({ friendRequests: receivedData || [], submitting: false });
      return rejected;
    } catch (err) {
      set({ friendRequests: previousRequests, error: err.message, submitting: false });
      throw err;
    }
  },

  // DELETE /friend-requests/:id — sert à la fois à annuler une demande
  // envoyée et à retirer un ami (même endpoint côté back, seul l'id passé
  // change). On ne sait pas toujours lequel des deux cas c'est d'ici, donc
  // on rafraîchit les deux listes concernées ; celle qui n'est pas
  // concernée ne changera juste pas.
  deleteFriendRequest: async (id) => {
    set({ submitting: true, error: null });
    const previousSent = get().sentFriendRequests;
    const previousFriends = get().friends;
    
    try {
      // ← OPTIMISTIC : retirer immédiatement des deux listes
      set((state) => ({
        sentFriendRequests: state.sentFriendRequests.filter((req) => req.id !== id),
        friends: state.friends.filter((f) => f.friendRequestId !== id),
      }));
      
      await deleteFriendRequestRequest(id);
      
      const [sentData, friendsData, acceptedData] = await Promise.all([
        fetchFriendRequestsRequest({ status: 'PENDING', type: 'sent' }),
        fetchFriendsRequest(),
        fetchFriendRequestsRequest({ status: 'ACCEPTED' }),
      ]);
      
      const acceptedRequests = acceptedData || [];
      const friends = (friendsData?.friends || []).map((friend) => {
        const match = acceptedRequests.find(
          (r) => r.sender?.id === friend.id || r.receiver?.id === friend.id
        );
        return { ...friend, friendRequestId: match?.id ?? null };
      });
      
      set({ sentFriendRequests: sentData || [], friends, submitting: false });
    } catch (err) {
      set({ sentFriendRequests: previousSent, friends: previousFriends, error: err.message, submitting: false });
      throw err;
    }
  },


  // GET /friend-requests?status=PENDING&type=received — demandes REÇUES
  fetchReceivedFriendRequests: async () => {
    try {
      const data = await fetchFriendRequestsRequest({ status: 'PENDING', type: 'received' });
      set({ friendRequests: data || [] });  // ← Juste remplacer, pas spread/concat
    } catch (err) {
    }
  },

  // GET /friend-requests?status=PENDING&type=sent — demandes que TU as
  // envoyées et qui attendent encore une réponse. Pas de raccourci
  // dédié côté back pour ça (/pending ne donne que les reçues), donc
  // on repasse par la route générique avec le bon filtre.
  fetchSentFriendRequests: async () => {
    try {
      const data = await fetchFriendRequestsRequest({ status: 'PENDING', type: 'sent' });
      set({ sentFriendRequests: data || [] });  // ← Idem
    } catch (err) {
    }
  },
    // GET /friends. La route ne renvoie que l'id de l'UTILISATEUR ami,
    // alors que "retirer un ami" (DELETE /friend-requests/:id) attend
    // l'id de la FriendRequest sous-jacente. On le retrouve en croisant
    // avec les requests ACCEPTED (reçues + envoyées) et on l'attache à
    // chaque ami sous `friendRequestId`.
    // → Si un jour le back ajoute ce champ directement dans la réponse
    // de /friends, ce croisement (et l'appel réseau en plus qu'il coûte)
    // pourra sauter.
    fetchFriends: async () => {
      try {
        const [friendsData, acceptedData] = await Promise.all([
          fetchFriendsRequest(),
          fetchFriendRequestsRequest({ status: 'ACCEPTED' }),
        ]);
        const acceptedRequests = acceptedData || []
        const friends = (friendsData?.friends || []).map((friend) => {
          const match = acceptedRequests.find(
            (r) => r.sender?.id === friend.id || r.receiver?.id === friend.id
          );
          return { ...friend, friendRequestId: match?.id ?? null };
        });
        set({ friends });
      } catch (err) {
      }
    },

  setOnlineUsers: (userIds) => {
    const map = {};
    (userIds || []).forEach((id) => { map[String(id)] = true; });
    set({ onlineUserIds: map });
  },

  setUserOnline: (userId) => {
    set((state) => ({ onlineUserIds: { ...state.onlineUserIds, [String(userId)]: true } }));
  },

  setUserOffline: (userId) => {
    set((state) => {
      const next = { ...state.onlineUserIds };
      delete next[String(userId)];
      return { onlineUserIds: next };
    });
  },

  clearError: () => set({ error: null }),
}));
