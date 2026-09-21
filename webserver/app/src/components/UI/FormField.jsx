/**
 * Champ de formulaire avec label + icône, stylé via les tokens.
 * Réutilisable partout où il faut un input labellisé
 */
export function FormField({ id, label, icon: Icon, className = '', ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          aria-hidden="true"
        />
        <input
          id={id}
          className={
            'w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] ' +
            'bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] ' +
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ' +
            'disabled:opacity-60 ' +
            className
          }
          {...inputProps}
        />
      </div>
    </div>
  );
}
