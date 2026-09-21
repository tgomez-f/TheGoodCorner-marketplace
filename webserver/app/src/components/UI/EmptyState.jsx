function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function EmptyState({ icon: Icon, title, description, action, iconSize = 40, className = '' }) {
  return (
    <div className={cx('flex flex-col items-center justify-center text-center', className)}>
      {Icon && <Icon size={iconSize} className="text-[var(--color-text-muted)] mb-4" />}
      {title && <p className="font-semibold text-[var(--color-text)] mb-1">{title}</p>}
      {description && <p className="text-sm text-[var(--color-text-muted)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}