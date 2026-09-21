import { Upload } from 'lucide-react';

export function FileInput({
  id,
  label,
  accept = '.png,.jpeg,.jpg',
  value,
  onChange,
  disabled = false,
  error = null,
}) {
  const fileName = value?.name || 'Aucun fichier';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={
            'flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] ' +
            'border-2 border-dashed border-[var(--color-border)] ' +
            'bg-[var(--color-bg-secondary)] text-[var(--color-text)] ' +
            'cursor-pointer hover:border-[var(--color-primary)] transition-colors ' +
            (disabled ? 'opacity-60 cursor-not-allowed' : '')
          }
        >
          <Upload size={18} className="text-[var(--color-text-muted)]" />
          <span className="text-sm truncate">{fileName}</span>
        </label>
      </div>
      {error && <p className="text-xs text-[var(--color-danger)] mt-1">{error}</p>}
    </div>
  );
}
