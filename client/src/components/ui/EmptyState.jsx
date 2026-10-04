export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-line bg-surface/50 my-4">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="text-xs text-muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
