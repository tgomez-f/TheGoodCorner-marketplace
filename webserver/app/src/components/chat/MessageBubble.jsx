import { Edit2, Trash2, Check, X } from 'lucide-react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '../UI/Button';
import { formatMessageTime } from '../../utils/date';

function MessageBubble({
  message,
  isMine,
  isEditing,
  editingContent,
  onEditingContentChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}) {
  const { t } = useLingui();

  return (
    <div className={`group flex items-end gap-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
      {isMine && !isEditing && (
        <div className="flex items-center gap-0.5 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit2}
            iconOnly
            aria-label={t`Modifier le message`}
            onClick={onStartEdit}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            iconOnly
            aria-label={t`Supprimer le message`}
            onClick={onDelete}
            className="hover:text-[var(--color-danger)]"
          />
        </div>
      )}

      <div
        className={`max-w-[75%] sm:max-w-[60%] rounded-[var(--radius-lg)] px-4 py-2.5 ${
          isMine
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-br-sm'
            : 'bg-[var(--color-surface-hover)] text-[var(--color-text)] rounded-bl-sm'
        }`}
      >
        {isEditing ? (
          <div className="flex items-center gap-2 min-w-[160px]">
            <input
              type="text"
              value={editingContent}
              onChange={(e) => onEditingContentChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
              autoFocus
              className="flex-1 min-w-0 text-sm bg-transparent border-b border-white/40 focus:outline-none focus:border-white"
            />
            <button
              onClick={onSaveEdit}
              aria-label={t`Valider`}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            >
              <Check size={16} />
            </button>
            <button
              onClick={onCancelEdit}
              aria-label={t`Annuler`}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
              {formatMessageTime(message.createdAt)}
              {message.modifiedAt && (
                <>
                  {' · '}
                  <Trans>modifié</Trans>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;