import { useLingui } from '@lingui/react/macro';

export const InfoCard = ({
  icon: Icon,
  label,
  value,
  editable = false,
  isEditing = false,
  onChange,
  type = 'text',
  placeholder,
}) => {
  const { t } = useLingui();
  const fallbackPlaceholder = placeholder ?? t`Non renseigné`;

  return (
    <div className='flex items-start gap-3'>
      {Icon && <Icon size={20} className='text-[var(--color-primary)] flex-shrink-0 mt-0.5' />}
      <div className='min-w-0 flex-1'>
        <p className='text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide'>
          {label}
        </p>
        {editable && isEditing ? (
          <input
            type={type}
            value={value ?? ''}
            onChange={onChange}
            placeholder={fallbackPlaceholder}
            className='w-full mt-0.5 text-sm font-medium text-[var(--color-text)] bg-transparent border-b border-dashed border-[var(--color-border)] focus:outline-none focus:border-solid focus:border-[var(--color-primary)] transition-colors py-0.5'
          />
        ) : (
          <p className='text-sm font-medium text-[var(--color-text)] mt-0.5'>
            {value || fallbackPlaceholder}
          </p>
        )}
      </div>
    </div>
  );
};