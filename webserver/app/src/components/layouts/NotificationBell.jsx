import { Suspense, lazy, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../UI/Button';
import { useUIStore } from '../../stores/uiStore';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useNotificationStore } from '../../stores/notificationStore';
import { useMessageStore } from '../../stores/messageStore';

const NotificationPopover = lazy(() =>
  import('../../pages/NotificationPopover').then((module) => ({ default: module.NotificationPopover }))
);

const badge = "absolute -top-1 -right-1 z-20 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold pointer-events-none";

export function NotificationBell() {
  const toggleUi = useUIStore((state) => state.toggleUi);
  const closeUi = useUIStore((state) => state.closeUi);
  const openUi = useUIStore((state) => state.openUi);
  const isNotifOpen = useUIStore((state) => state.UserInterfaces['notification-popover']) || false;

  const wasOpenRef = useRef(false);
  const justClosedByOutsideRef = useRef(false);

  const notifRef = useClickOutside(() => {
    justClosedByOutsideRef.current = true;
    closeUi('notification-popover');
    setTimeout(() => {
      justClosedByOutsideRef.current = false;
    }, 150);
  }, isNotifOpen);

  const notificationsEnabled = useNotificationStore((state) => state.notificationsEnabled);
  const notifications = useNotificationStore((state) => state.notifications) || [];
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  const unreadCounts = useMessageStore((state) => state.unreadCounts) || {};
  const totalUnreadMessages = Object.values(unreadCounts).reduce((sum, count) => sum + Number(count || 0), 0);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const totalCount = totalUnreadMessages + unreadNotifsCount;

  useEffect(() => {
    if (notificationsEnabled && fetchNotifications) {
      fetchNotifications();
    }
  }, [notificationsEnabled, fetchNotifications]);

  const handleMouseDown = () => {
    wasOpenRef.current = isNotifOpen;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!notificationsEnabled) return;

    if (wasOpenRef.current || justClosedByOutsideRef.current) {
      closeUi('notification-popover');
    } else {
      openUi('notification-popover');
    }
  };

  return (
    <div className={`relative ${!notificationsEnabled ? 'opacity-40 pointer-events-none' : ''}`} ref={notifRef}>
      <Button
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        variant="ghost"
        icon={Bell}
        aria-label="Notifications"
      />
      {notificationsEnabled && totalCount > 0 && (
        <div className={badge}>{totalCount}</div>
      )}
      {notificationsEnabled && isNotifOpen && (
        <Suspense fallback={null}>
          <NotificationPopover />
        </Suspense>
      )}
    </div>
  );
}