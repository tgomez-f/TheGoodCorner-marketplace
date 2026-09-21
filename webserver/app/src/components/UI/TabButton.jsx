export function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
        active
          ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
          : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
      }`}
    >
      {children}
    </button>
  );
}