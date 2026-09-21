import { useUIStore } from '../stores/uiStore';
import { useMessageStore } from '../stores/messageStore';
import { useNotificationStore } from '../stores/notificationStore';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';

export function NotificationPopover() {
  const isOpen = useUIStore((state) => state.UserInterfaces['notification-popover']) || false;
  const closeUi = useUIStore((state) => state.closeUi);
  const conversations = useMessageStore((state) => state.conversations);
  const unreadCounts = useMessageStore((state) => state.unreadCounts) || {};
  const setActiveConversation = useMessageStore((state) => state.setActiveConversation);
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const notificationsEnabled = useNotificationStore((state) => state.notificationsEnabled);
  const navigate = useNavigate();

  const unreadConversations = conversations.filter(
    (c) => (unreadCounts[c.interlocutor.id] || 0) > 0
  );
  const unreadNotifs = notifications.filter((n) => !n.read);

  if (!notificationsEnabled) return null;

  const allNotifications = [
    ...unreadConversations.map((c) => ({
      type: 'message',
      key: `msg-${c.interlocutor.id}`,
      date: c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).getTime() : 0,
      data: c,
    })),
    ...unreadNotifs.map((n) => ({
      type: n.type,
      key: `notif-${n.id}`,
      date: new Date(n.createdAt).getTime(),
      data: { ...n.content, notifId: n.id },
    })),
  ].sort((a, b) => b.date - a.date);

  const hasNotifications = allNotifications.length > 0;

  const handleMessageClick = (e, interlocutorId) => {
    e.stopPropagation();

    useMessageStore.setState((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [interlocutorId]: 0,
      },
    }));

    setActiveConversation(interlocutorId);

    closeUi('notification-popover');

    navigate(`/messagerie?userId=${interlocutorId}`);
  };

  const handleReviewClick = (e, notifId) => {
    e.stopPropagation();
    markAsRead(notifId);
    closeUi('notification-popover');
    navigate('/profile?tab=reviews');
  };

  const handleFriendNotifClick = (e, notifId) => {
    e.stopPropagation();
    markAsRead(notifId);
    closeUi('notification-popover');
    navigate('/profile?tab=friends');
  };

  const handleProductSoldClick = (e, notifId) => {
    e.stopPropagation();
    markAsRead(notifId);
    closeUi('notification-popover');
    navigate('/profile?tab=products');
  };

  return (
    <div className="absolute top-10 right-0 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-4 text-[var(--color-text)]">
                <Trans>Notifications</Trans>
              </h3>
              {!hasNotifications ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  <Trans>Aucune notification</Trans>
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {allNotifications.map((notif) =>
                    notif.type === 'PRODUCT_SOLD' ? (
                      <li
                        key={notif.key}
                        onClick={(e) => handleProductSoldClick(e, notif.data.notifId)}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-[var(--color-text)] truncate">
                            Article vendu !
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)] truncate">
                            {notif.data.productName} × {notif.data.quantity} — +{Number(notif.data.gain).toFixed(2)} €
                          </span>
                        </div>
                      </li>
                    ) : notif.type === 'message' ? (
                      <li
                        key={notif.key}
                        onClick={(e) => handleMessageClick(e, notif.data.interlocutor.id)}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-[var(--color-text)] truncate">
                            {notif.data.interlocutor.username}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)] truncate">
                            {notif.data.lastMessage?.content || '...'}
                          </span>
                        </div>
                        <div className="flex-shrink-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {unreadCounts[notif.data.interlocutor.id]}
                        </div>
                      </li>
                    ) : notif.type === 'REVIEW' ? (
                      <li
                        key={notif.key}
                        onClick={(e) => handleReviewClick(e, notif.data.notifId)}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-[var(--color-text)] truncate">
                            <Trans>Nouvel avis</Trans>
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)] truncate">
                            <Trans>
                              {notif.data.authorUsername} a laissé un avis ({notif.data.rating}★)
                            </Trans>
                          </span>
                        </div>
                      </li>
                    ) : (
                      <li
                        key={notif.key}
                        onClick={(e) => handleFriendNotifClick(e, notif.data.notifId)}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-[var(--color-text)] truncate">
                            {notif.type === 'FRIEND_REQUEST' && <Trans>Demande d'ami</Trans>}
                            {notif.type === 'FRIEND_ACCEPTED' && <Trans>Demande acceptée</Trans>}
                            {notif.type === 'FRIEND_REJECTED' && <Trans>Demande refusée</Trans>}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)] truncate">
                            {notif.type === 'FRIEND_REQUEST' && (
                              <Trans>{notif.data.sender?.username} veut vous ajouter</Trans>
                            )}
                            {notif.type === 'FRIEND_ACCEPTED' && (
                              <Trans>{notif.data.acceptedBy?.username} a accepté votre demande</Trans>
                            )}
                            {notif.type === 'FRIEND_REJECTED' && (
                              <Trans>{notif.data.rejectedBy?.username} a refusé votre demande</Trans>
                            )}
                          </span>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}