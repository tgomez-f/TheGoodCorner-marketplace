import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore'
import { Button } from '../UI/Button';
import Avatar from '../UI/Avatar';
import { Dropdown } from '../UI/Dropdown';
import { LogOut, UserRound, MessageCircle, Settings, ShoppingCart} from 'lucide-react'

function ProfileDropdown() {
  const { isAuthenticated, logout, initializing } = useAuthStore();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  // Le temps que initAuth() (appelé une fois dans App.jsx) tranche entre
  // "session restaurée" ou "pas de session" — évite un flash "Se connecter"
  // qui basculerait immédiatement sur le profil si la reconnexion réussit.
  if (initializing) {
    return <div className="w-24 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] animate-pulse" />;
  }

  if (!isAuthenticated) {
    return (
      <Button to="/authentication" variant="ghost">
        <Avatar size="sm" />
        Se connecter
      </Button>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Dropdown>
      <Dropdown.Trigger as={Button} variant="ghost">
        <Avatar src={user?.avatar} alt={user?.username || 'Profil'} name={user?.username} size="sm" />
        <span>{user?.username || 'Profil'}</span>
      </Dropdown.Trigger>

      <Dropdown.Menu>
        <Dropdown.Label>
          <p className="text-base font-medium text-[var(--color-text)]">
            {user?.username || 'Utilisateur'}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">{user?.email || ''}</p>
        </Dropdown.Label>

        <Dropdown.Separator />

        <Dropdown.Item as={Link} to="/profile">
          <UserRound/>
            Mon Profil
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/messagerie">
          <MessageCircle/>
            Mes messages
        </Dropdown.Item>
        <Dropdown.Item as = {Link} to="/settings">
          <Settings/>
            Parametres
        </Dropdown.Item>
		 <Dropdown.Item as = {Link} to="/orders">
          <ShoppingCart/>
            Mes Commandes
        </Dropdown.Item>

        <Dropdown.Separator />

        <Dropdown.Item variant="danger" onClick={handleLogout}>
          <LogOut/>
            Se déconnecter
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ProfileDropdown;
