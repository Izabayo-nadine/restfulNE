import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  required = true,
  autoComplete = 'current-password',
  minLength,
  hint,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="input-field pr-10"
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
