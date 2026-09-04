interface FieldProps {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
}

export default function Field({
  id,
  label,
  type,
  required,
  minLength,
  autoComplete,
  value,
  onChange,
  placeholder,
  error,
}: FieldProps) {
  const errorId = `${id}-error`;
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
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-[var(--radius-md)] border bg-input-bg px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 transition-shadow min-h-[44px] ${
          error
            ? "border-danger focus:border-danger focus:ring-danger/20"
            : "border-input-border focus:border-input-focus focus:ring-input-ring"
        }`}
        placeholder={placeholder}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
