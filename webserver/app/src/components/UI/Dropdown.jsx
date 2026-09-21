import { createContext, useContext, useEffect, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

/**
 * Dropdown - composant "compound" modulaire, auto-stylé (comme Button) :
 * il n'a besoin d'aucune classe CSS externe pour être utilisable.
 *
 *   <Dropdown>
 *     <Dropdown.Trigger as={Button} variant="ghost">Profil</Dropdown.Trigger>
 *     <Dropdown.Menu>
 *       <Dropdown.Item onClick={...}>Mon compte</Dropdown.Item>
 *       <Dropdown.Item as={Link} to="/settings">Paramètres</Dropdown.Item>
 *       <Dropdown.Separator />
 *       <Dropdown.Item variant="danger" onClick={...}>Supprimer</Dropdown.Item>
 *     </Dropdown.Menu>
 *   </Dropdown>
 *
 * Usage "controlé" (état géré ailleurs, ex: uiStore, utile pour coordonner
 * plusieurs dropdowns entre eux sur toute l'app) :
 *
 *   <Dropdown open={isOpen} onOpenChange={setIsOpen}>...</Dropdown>
 */

const DropdownContext = createContext(null);

function useDropdownContext(componentName) {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error(`<Dropdown.${componentName} /> doit être utilisé à l'intérieur d'un <Dropdown>.`);
  }
  return context;
}

// Petit helper pour combiner les classes sans dépendance externe (même logique que Button)
function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Dropdown({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className = '',
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  // Si "open" est fourni par le parent, le composant devient "controlé":
  // c'est le parent qui décide de l'état, Dropdown se contente de l'afficher.
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = (value) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  };

  const close = () => setOpen(false);
  const open = () => setOpen(true);
  const toggle = () => setOpen(!isOpen);

  // Ferme au clic en dehors du dropdown (écouteur actif seulement quand ouvert)
  const containerRef = useClickOutside(close, isOpen);

  // Ferme à la touche Echap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, open, close, toggle }}>
      {/* relative inline-block : le Menu se positionne par rapport à ce wrapper,
          plus besoin d'une classe externe type .profile-section pour ça */}
      <div ref={containerRef} className={cx('relative inline-block', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

/**
 * L'élément qui ouvre/ferme le dropdown au clic.
 * `as` permet de le rendre avec n'importe quel composant (par défaut un
 * <button>, mais le plus souvent ton composant <Button> existant — c'est
 * lui qui porte alors tout le style visuel du déclencheur).
 */
Dropdown.Trigger = function DropdownTrigger({
  children,
  as: Component = 'button',
  className = '',
  onClick,
  ...props
}) {
  const { toggle, isOpen } = useDropdownContext('Trigger');

  const handleClick = (e) => {
    onClick?.(e);
    toggle();
  };

  return (
    <Component
      type={Component === 'button' ? 'button' : undefined}
      className={className}
      onClick={handleClick}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Le menu déroulant : positionnement, fond, bordure et ombre sont gérés ici,
 * avec les tokens (donc compatible clair/sombre automatiquement).
 */
Dropdown.Menu = function DropdownMenu({ children, className = '', align = 'right' }) {
  const { isOpen } = useDropdownContext('Menu');
  if (!isOpen) return null;

  return (
    <div
      role="menu"
      className={cx(
        'absolute z-50 mt-2 min-w-[280px] py-2 overflow-hidden animate-in',
        'rounded-[var(--radius-md)] border shadow-lg',
        'bg-[var(--color-surface)] border-[var(--color-border)]',
        align === 'right' ? 'right-0' : 'left-0',
        className
      )}
    >
      {children}
    </div>
  );
};

const itemVariantStyles = {
  default: 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
  danger: 'text-[var(--color-danger)] hover:bg-[var(--color-danger-surface)]',
};

/**
 * Une entrée du menu. Ferme le dropdown après le clic par défaut
 * (passe closeOnClick={false} pour désactiver ce comportement).
 * `as` permet d'en faire un <Link>, une <a>, etc.
 * `variant="danger"` pour les actions destructives (ex: se déconnecter).
 */
Dropdown.Item = function DropdownItem({
  children,
  onClick,
  as: Component = 'button',
  variant = 'default',
  className = '',
  closeOnClick = true,
  ...props
}) {
  const { close } = useDropdownContext('Item');

  const handleClick = (e) => {
    onClick?.(e);
    if (closeOnClick) close();
  };

  return (
    <Component
      type={Component === 'button' ? 'button' : undefined}
      role="menuitem"
      onClick={handleClick}
      className={cx(
        'flex w-full items-center gap-3 px-4 py-2 text-base text-left transition-colors',
        itemVariantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

/** Zone libre en tête de menu (ex: nom + email de l'utilisateur) */
Dropdown.Label = function DropdownLabel({ children, className = '' }) {
  return <div className={cx('px-4 py-0.80 text-center', className)}>{children}</div>;
};

/** Séparateur entre groupes d'items */
Dropdown.Separator = function DropdownSeparator({ className = '' }) {
  return <hr className={cx('my-1 border-[var(--color-border)]', className)} />;
};

export default Dropdown;
