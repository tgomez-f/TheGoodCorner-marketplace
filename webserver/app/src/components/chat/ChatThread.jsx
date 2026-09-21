import { Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Send } from 'lucide-react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '../UI/Button';
import Avatar from '../UI/Avatar';
import MessageBubble from './MessageBubble';

function ChatThread({
  conversation,
  messages,
  messagesLoading,
  currentUserId,
  editingMessageId,
  editingContent,
  onEditingContentChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteMessage,
  messageText,
  sendError,
  onMessageTextChange,
  onSendMessage,
  sending,
  onBack,
}) {
  const { t } = useLingui();

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <MessageCircle size={40} className="text-[var(--color-text-muted)] mb-4" />
        <p className="font-semibold text-[var(--color-text)] mb-1">
          <Trans>Sélectionne une conversation</Trans>
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          <Trans>Choisis une discussion dans la liste, ou démarre-en une nouvelle.</Trans>
        </p>
      </div>
    );
  }

  const { interlocutor } = conversation;

  return (
    <>
      <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <button
          onClick={onBack}
          className="sm:hidden text-[var(--color-text-muted)]"
          aria-label={t`Retour aux conversations`}
        >
          <ArrowLeft size={18} />
        </button>
        <Link
          to={`/profile/${interlocutor.id}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={interlocutor.avatar}
            alt={interlocutor.username}
            name={interlocutor.username}
            size="md"
          />
          <span className="font-semibold text-[var(--color-text)]">
            {interlocutor.username}
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--color-bg)]">
        {messagesLoading && messages.length === 0 ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`h-10 w-2/3 rounded-[var(--radius-lg)] bg-[var(--color-surface-hover)] ${
                  i % 2 ? 'ml-auto' : ''
                }`}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
            <Trans>Aucun message pour le moment — dis bonjour !</Trans>
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={String(message.senderId) === String(currentUserId)}
              isEditing={editingMessageId === message.id}
              editingContent={editingContent}
              onEditingContentChange={onEditingContentChange}
              onStartEdit={() => onStartEdit(message)}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onDelete={() => onDeleteMessage(message.id)}
            />
          ))
        )}
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        {sendError && (
          <p className="text-xs text-[var(--color-danger)] font-medium mb-2 px-1" role="alert">
            {sendError}
          </p>
        )}
        <form onSubmit={onSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => onMessageTextChange(e.target.value)}
            placeholder={t`Écris un message...`}
            disabled={sending}
            className="flex-1 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors disabled:opacity-60"
          />
          <Button
            type="submit"
            variant="primary"
            icon={Send}
            iconOnly
            disabled={sending || !messageText.trim()}
            aria-label={t`Envoyer`}
          />
        </form>
      </div>
    </>
  );
}

export default ChatThread;