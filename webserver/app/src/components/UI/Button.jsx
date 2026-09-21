import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Toutes les couleurs viennent des tokens (styles/tokens.css) via la
// syntaxe Tailwind arbitraire var(--x) : Button s'adapte donc au thème
// sans jamais tester `theme === 'dark'` lui-même.
const baseStyles =
  'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)] ' +
  'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

const variantStyles = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] ' +
    'active:bg-[var(--color-primary-active)] focus-visible:ring-[var(--color-primary)]',
  secondary:
    'bg-[var(--color-surface-hover)] text-[var(--color-text)] hover:bg-[var(--color-border)] ' +
    'active:bg-[var(--color-border)] focus-visible:ring-[var(--color-border)]',
  outline:
    'border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-surface)] ' +
    'hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-border)] focus-visible:ring-[var(--color-border)]',
  ghost:
    'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-border)] ' +
    'focus-visible:ring-[var(--color-border)]',
  danger:
    'bg-[var(--color-danger)] text-[var(--color-on-danger)] hover:bg-[var(--color-danger-hover)] ' +
    'active:bg-[var(--color-danger-active)] focus-visible:ring-[var(--color-danger)]',
};

const sizeStyles = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

// Padding carré pour les boutons icône seule (sans texte à côté)
const iconOnlySizeStyles = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

const iconDimensions = { sm: 14, md: 16, lg: 18 };

// Petit helper pour combiner les classes sans dépendance externe (clsx-like)
function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  iconOnly: iconOnlyProp = false,
  iconPosition = 'left',
  className = '',
  to,
  children,
  ...props
}) {
  const iconOnly = iconOnlyProp || (Boolean(Icon) && !children);
  const dim = iconDimensions[size];

  // if (
  //   typeof process !== 'undefined' &&
  //   process.env?.NODE_ENV !== 'production' &&
  //   iconOnly &&
  //   !props['aria-label']
  // ) {
  //   console.warn("Button: ajoute un aria-label quand le bouton n'a qu'une icône, sans texte.");
  // }

  const classes = cx(
    baseStyles,
    variantStyles[variant],
    iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
    fullWidth && 'w-full',
    className
  );

  const content = (
    <>
      {loading && <Loader2 size={dim} className="animate-spin" aria-hidden="true" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={dim} aria-hidden="true" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={dim} aria-hidden="true" />}
    </>
  );

  // Rendu comme un vrai lien de navigation quand `to` est fourni (sauf
  // désactivé/chargement : un <Link> ne peut pas être "disabled" comme un
  // <button>, donc on retombe sur un bouton natif désactivé dans ce cas).
  if (to && !disabled && !loading) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {content}
    </button>
  );
}