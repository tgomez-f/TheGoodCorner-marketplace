import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SendMessage, GetMessage, GetAllMessages, UpdateMessage, DeleteMessage } from '../api/messageApi';
import { useUserStore } from './userStore';

/**
 * Store de la messagerie.
 *
 * Forme d'une conversation telle que renvoyée par GET /message
 * (MessageService.getConversationList) :
 *   { interlocutor: { id, username, avatar, email }, lastMessage: { id, content, createdAt, senderId, modifiedAt } | null }
 *
 * Pas de compteur de non-lus exposé par cette route (le schema a bien
 * Message.isRead, mais rien ne l'agrège ici) — pas de badge "non lu"
 * affiché côté front tant que ce n'est pas branché côté back.
 *
 * Persistance volontairement limitée à `conversations` (résumés légers) —
 * sert juste à afficher quelque chose instantanément à l'ouverture de la
 * page pendant que le vrai fetch tourne en arrière-plan, comme cartStore.
 * Le CONTENU des messages n'est JAMAIS persisté (donnée privée, toujours
 * rechargée depuis l'API) et est vidé à la déconnexion — voir
 * authStore.logout() → useMessageStore.getState().reset().
 *
 * Temps réel : src/socket.js appelle receiveMessage / handleMessageUpdated /
 * handleMessageDeleted sur les événements receive_direct_message /
 * message_updated / message_deleted.
 */
export const useMessageStore = create(
  persist(
    (set, get) => ({
      conversations: [],
      hiddenConversationIds: [],
      unreadCounts: {},
      conversationsLoading: false,
      conversationsError: null,

      activeConversationId: null,

      // Jamais persisté : toujours frais depuis l'API.
      messagesByConversation: {},
      messagesLoading: false,
      messagesError: null,

      sending: false,
      error: null,

      fetchConversations: async () => {
        set({ conversationsLoading: true, conversationsError: null });
        try {
          const data = await GetAllMessages();
          const serverConversations = Array.isArray(data) ? data : [];
          set((state) => {
            // Garde les conversations "brouillon" tout juste créées côté
            // client (bouton "Contacter le vendeur", "Nouvelle discussion")
            // tant qu'aucun message réel n'a été échangé — le serveur ne
            // les connaît pas encore, un fetch concurrent ne doit pas les
            // effacer.
            const serverIds = new Set(serverConversations.map((c) => String(c.interlocutor.id)));
            const localDrafts = state.conversations.filter(
              (c) => c.lastMessage === null && !serverIds.has(String(c.interlocutor.id))
            );
            return { conversations: [...localDrafts, ...serverConversations], conversationsLoading: false };
          });
        } catch (err) {
          set({ conversationsError: err.message, conversationsLoading: false });
        }
      },

      setActiveConversation: (conversationId) => {
        set((state) => ({
          activeConversationId: conversationId,
          unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
        }));
        get().fetchMessages(conversationId);
      },

      // Appelé au démontage de la page Messagerie (voir pages/Messagerie.jsx)
      // pour qu'un message reçu APRÈS avoir quitté la page compte bien comme
      // non lu, même si cette conversation était la dernière ouverte.
      clearActiveConversation: () => set({ activeConversationId: null }),

      // Masque une conversation de la sidebar sans toucher aux messages
      // (aucun endpoint de suppression de conversation côté back — voir
      // messageApi.jsx). Réapparaît automatiquement au prochain message
      // envoyé/reçu (voir _touchConversation) ou si on la rouvre via
      // startConversationWith.
      hideConversation: (interlocutorId) => {
        set((state) => ({
          hiddenConversationIds: state.hiddenConversationIds.includes(String(interlocutorId))
            ? state.hiddenConversationIds
            : [...state.hiddenConversationIds, String(interlocutorId)],
          unreadCounts: { ...state.unreadCounts, [interlocutorId]: 0 },
          activeConversationId:
            String(state.activeConversationId) === String(interlocutorId) ? null : state.activeConversationId,
        }));
      },

      unhideConversation: (interlocutorId) => {
        set((state) => ({
          hiddenConversationIds: state.hiddenConversationIds.filter((id) => id !== String(interlocutorId)),
        }));
      },

      // Toujours re-fetch (pas de cache) : les messages sont une donnée
      // privée qui doit rester à jour, contrairement aux résumés de conv.
      fetchMessages: async (conversationId) => {
        set({ messagesLoading: true, messagesError: null });
        try {
          const data = await GetMessage(conversationId);
          set((state) => ({
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: Array.isArray(data) ? data : [],
            },
            messagesLoading: false,
          }));
        } catch (err) {
          set({ messagesError: err.message, messagesLoading: false });
        }
      },

      sendMessage: async (conversationId, content) => {
        set({ sending: true, error: null });
        try {
          SendMessage(conversationId, content); // ← PAS d'await, pas d'assignment
          // La réponse vient via le socket listener → receiveMessage()
          set({ sending: false });
          return; // ← Retourne sans newMessage
        } catch (err) {
          set({ error: err.message, sending: false });
          throw err;
        }
      },

      updateMessage: async (messageId, conversationId, content) => {
        const previous = get().messagesByConversation[conversationId];
        set((state) => ({
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: (state.messagesByConversation[conversationId] || []).map((m) =>
              m.id === messageId ? { ...m, content, modifiedAt: new Date().toISOString() } : m
            ),
          },
        }));
        try {
          const updated = await UpdateMessage(messageId, content);
          set((state) => ({
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: (state.messagesByConversation[conversationId] || []).map((m) =>
                m.id === messageId ? updated : m
              ),
            },
          }));
        } catch (err) {
          set((state) => ({
            messagesByConversation: { ...state.messagesByConversation, [conversationId]: previous },
          }));
          throw err;
        }
      },

      deleteMessage: async (messageId, conversationId) => {
        const previous = get().messagesByConversation[conversationId];
        set((state) => ({
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: (state.messagesByConversation[conversationId] || []).filter((m) => m.id !== messageId),
          },
        }));
        try {
          await DeleteMessage(messageId);
        } catch (err) {
          set((state) => ({
            messagesByConversation: { ...state.messagesByConversation, [conversationId]: previous },
          }));
          throw err;
        }
      },

      // Démarre (ou rouvre) une conversation avec un utilisateur choisi
      // dans SelectUserModal, avant même qu'un premier message soit envoyé.
      startConversationWith: (selectedUser) => {
        get().unhideConversation(selectedUser.id);
        const exists = get().conversations.some((c) => String(c.interlocutor.id) === String(selectedUser.id));
        if (!exists) {
          const draft = { interlocutor: selectedUser, lastMessage: null };
          set((state) => ({ conversations: [draft, ...state.conversations] }));
        }
        get().setActiveConversation(selectedUser.id);
      },

      // Met à jour (ou crée) l'entrée "dernier message" d'une conversation
      // dans la liste, sans tout re-fetch — utilisé après un envoi et par
      // les événements socket entrants. Fait remonter la conversation en
      // haut de liste (comme une vraie messagerie).
      _touchConversation: (conversationId, message) => {
        get().unhideConversation(conversationId);
        set((state) => {
          const idx = state.conversations.findIndex((c) => String(c.interlocutor.id) === String(conversationId));
          const lastMessage = {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId,
            modifiedAt: message.modifiedAt,
          };

          if (idx === -1) {
            // Premier message reçu de quelqu'un pas encore dans la liste :
            // on construit la conversation à partir de l'expéditeur inclus
            // dans le message (voir MessageService.saveMessage → sender).
            if (!message.sender) return state; // pas assez d'info, un fetchConversations() la ramènera
            return { conversations: [{ interlocutor: message.sender, lastMessage }, ...state.conversations] };
          }

          const updated = { ...state.conversations[idx], lastMessage };
          const rest = state.conversations.filter((_, i) => i !== idx);
          return { conversations: [updated, ...rest] };
        });
      },

      // --- Points d'entrée temps réel (appelés depuis src/socket.js) ---

      receiveMessage: (message) => {
        const currentUser = useUserStore.getState().user;
        if (!currentUser?.id)
          return;
        // Détermine l'ID de la conversation :
        // c'est l'ID de l'autre personne (pas de soi-même)
        const conversationId = message.senderId === currentUser?.id 
          ? message.receiverId  // Je suis le sender → convo avec le receiver
          : message.senderId;   // Je suis le receiver → convo avec le sender

        // Un message compte comme "non lu" seulement si c'est moi le
        // destinataire (pas l'écho de mes propres envois) ET que je ne suis
        // pas déjà en train de regarder cette conversation.
        const isIncoming = String(message.senderId) !== String(currentUser.id);
        const isConversationOpen = String(get().activeConversationId) === String(conversationId);

        set((state) => {
          const existing = state.messagesByConversation[conversationId] || [];
          const alreadyKnown = existing.some((m) => m.id === message.id);
          if (alreadyKnown) return state;

          return {
            messagesByConversation: { ...state.messagesByConversation, [conversationId]: [...existing, message] },
            unreadCounts:
              isIncoming && !isConversationOpen
                ? { ...state.unreadCounts, [conversationId]: (state.unreadCounts[conversationId] || 0) + 1 }
                : state.unreadCounts,
          };
        });
        get()._touchConversation(conversationId, message);
      },

      handleMessageUpdated: (message) => {
        const state = get();
        const conversationId = Object.keys(state.messagesByConversation).find((cid) =>
          (state.messagesByConversation[cid] || []).some((m) => m.id === message.id)
        );

        if (!conversationId) {
          get().fetchConversations();
          return;
        }

        const updatedMessages = state.messagesByConversation[conversationId].map((m) =>
          m.id === message.id ? message : m
        );

        const currentLastMessage = state.conversations.find(
          (c) => String(c.interlocutor.id) === String(conversationId)
        )?.lastMessage;

        const updatedConversations = currentLastMessage?.id === message.id
          ? state.conversations.map((c) =>
              String(c.interlocutor.id) === String(conversationId)
                ? { ...c, lastMessage: { ...c.lastMessage, content: message.content, modifiedAt: message.modifiedAt } }
                : c
            )
          : state.conversations;

        set({
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: updatedMessages,
          },
          conversations: updatedConversations,
        });
      },

      handleMessageDeleted: ({ messageId }) => {
        const state = get();
        const next = { ...state.messagesByConversation };
        const newUnreadCounts = { ...state.unreadCounts };
        let updatedConversations = state.conversations;
        let found = false;

        for (const cid of Object.keys(next)) {
          const msg = next[cid].find((m) => m.id === messageId);
          if (msg) {
            found = true;
            const currentUser = useUserStore.getState().user;
            const isIncoming = String(msg.senderId) !== String(currentUser?.id);
            const isConversationOpen = String(state.activeConversationId) === String(cid);
            if (isIncoming && !isConversationOpen && newUnreadCounts[cid] > 0) {
              newUnreadCounts[cid] = newUnreadCounts[cid] - 1;
            }
            next[cid] = next[cid].filter((m) => m.id !== messageId);

            const newLastMessage = next[cid].length > 0 ? next[cid][next[cid].length - 1] : null;
            updatedConversations = state.conversations.map((c) =>
              String(c.interlocutor.id) === String(cid)
                ? { ...c, lastMessage: newLastMessage }
                : c
            );
            break;
          }
        }

        if (found) {
          set({ messagesByConversation: next, unreadCounts: newUnreadCounts, conversations: updatedConversations });
        } else {
          get().fetchConversations();
        }
      },

      clearError: () => set({ error: null, conversationsError: null, messagesError: null }),

      // Vide tout à la déconnexion — les messages sont une donnée privée,
      // pas question qu'ils traînent en mémoire/localStorage pour le
      // prochain compte connecté sur ce navigateur.
      reset: () =>
        set({
          conversations: [],
          hiddenConversationIds: [],
          unreadCounts: {},
          activeConversationId: null,
          messagesByConversation: {},
          error: null,
          conversationsError: null,
          messagesError: null,
        }),
    }),
    {
      name: 'message-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        hiddenConversationIds: state.hiddenConversationIds,
        unreadCounts: state.unreadCounts,
        conversations: state.conversations.map((c) => ({
          interlocutor: {
            id: c.interlocutor.id,
            username: c.interlocutor.username,
            avatar: c.interlocutor.avatar,
          },
          lastMessage: c.lastMessage,
        })),
      }),
    }
  )
);
