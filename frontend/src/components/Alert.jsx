export default function Alert({ type = 'error', children }) {
  const styles =
    type === 'success'
      ? 'border-green-200 bg-green-50 text-green-800'
      : 'border-red-200 bg-red-50 text-red-800';
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`} role="alert">
      {children}
      {Array.isArray(children) ? null : null}
    </div>
  );
}

export function FieldErrors({ errors }) {
  if (!errors?.length) return null;
  return (
    <ul className="mt-2 list-inside list-disc text-sm text-red-600">
      {errors.map((e, i) => (
        <li key={i}>{e.field ? `${e.field}: ` : ''}{e.message}</li>
      ))}
    </ul>
  );
}
