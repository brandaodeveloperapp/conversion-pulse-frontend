export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mb-6 flex flex-col gap-1">
      <h1 className="font-display text-2xl font-semibold text-text-primary">
        {title}
      </h1>
      <p className="text-sm text-text-secondary">{subtitle}</p>
    </header>
  );
}

export function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex h-96 items-center justify-center rounded-lg border border-border-subtle bg-surface text-text-muted">
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
        {label}
      </span>
    </div>
  );
}

export function ErrorPanel({
  status,
  title,
  badRequestMessage,
  genericMessage,
}: {
  status: number;
  title: string;
  badRequestMessage: string;
  genericMessage: string;
}) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-lg border border-danger-subtle bg-danger-subtle text-danger">
      <p className="font-medium">{title}</p>
      <p className="text-sm">
        {status === 400 ? badRequestMessage : genericMessage}
      </p>
    </div>
  );
}

export function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border-subtle text-text-muted">
      {message}
    </div>
  );
}
