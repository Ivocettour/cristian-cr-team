export function Footer() {
  return (
    <footer className="mt-16 border-t border-border-subtle px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <span className="font-heading text-sm text-white">
          CLUB PÁDEL <span className="text-accent">DEL SUR</span>
        </span>
        <span className="text-xs text-foreground-muted">
          Torneos, cuadros y resultados en vivo — sin necesidad de crear cuenta.
        </span>
      </div>
    </footer>
  );
}
