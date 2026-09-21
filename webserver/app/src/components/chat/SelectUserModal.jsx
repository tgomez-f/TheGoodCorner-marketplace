import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Trans, useLingui } from '@lingui/react/macro';
import { GetAllUsers } from '../../api/userApi';
import { useUserStore } from '../../stores/userStore';
import Avatar from '../UI/Avatar';

function SelectUserModal({ isOpen, onClose, onSelectUser }) {
  const { t } = useLingui();
  const currentUser = useUserStore((state) => state.user);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await GetAllUsers();
      setUsers(Array.isArray(allUsers) ? allUsers : []);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter((user) => !currentUser || String(user.id) !== String(currentUser.id))
    .filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[600px] flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-2xl animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            <Trans>Nouvelle discussion</Trans>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
            aria-label={t`Fermer`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder={t`Rechercher un utilisateur...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] animate-pulse" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-sm text-[var(--color-text-muted)] py-12">
              <Trans>Aucun utilisateur trouvé</Trans>
            </p>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 text-left border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <Avatar src={user.avatar} alt={user.username} name={user.username} size="md" className="flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate">{user.username}</p>
                  {user.name && <p className="text-xs text-[var(--color-text-muted)] truncate">{user.name}</p>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectUserModal;