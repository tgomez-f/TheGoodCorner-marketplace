import { Trash2 } from 'lucide-react';
import { Trans, useLingui } from '@lingui/react/macro';
import Avatar from '../UI/Avatar';
import { Button } from '../UI/Button';
import { formatConversationTime } from '../../utils/date';

function ConversationListItem({ interlocutor, lastMessage, unreadCount = 0, isActive, onClick, onDelete }) {
  const { t } = useLingui();

  return (
    <div
      className={`group flex items-center border-b border-[var(--color-border)] transition-colors ${
        isActive ? 'bg-[var(--color-surface-hover)]' : 'hover:bg-[var(--color-surface-hover)]'
      }`}
    >
      <button onClick={onClick} className="flex-1 flex items-center gap-3 p-3 text-left min-w-0">
        <Avatar src={interlocutor.avatar} alt={interlocutor.username} name={interlocutor.username} size={44} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-[var(--color-text)] truncate">
              {interlocutor.username}
            </span>
            {lastMessage?.createdAt && (
              <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                {formatConversationTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
            {lastMessage?.content || <Trans>Nouvelle conversation</Trans>}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-2 pr-3 flex-shrink-0">
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          icon={Trash2}
          iconOnly
          aria-label={t`Supprimer la conversation avec ${interlocutor.username}`}
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--color-danger)]"
        />
      </div>
    </div>
  );
}

export default ConversationListItem;