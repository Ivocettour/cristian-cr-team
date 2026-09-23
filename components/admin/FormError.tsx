export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-accent/40 bg-accent-dark/20 px-3 py-2 text-sm text-white">
      {message}
    </p>
  );
}
