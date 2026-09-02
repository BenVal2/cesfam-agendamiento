interface FieldProps {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  minLength?: number;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

export default function Field({
  id,
  label,
  type,
  required,
  minLength,
  value,
  onChange,
  placeholder,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-fg mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[var(--radius-md)] border border-input-border bg-input-bg px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-input-ring transition-shadow min-h-[44px]"
        placeholder={placeholder}
      />
    </div>
  );
}
