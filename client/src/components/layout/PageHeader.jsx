export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">{title}</h1>
        {description && <p className="text-xs text-muted mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
