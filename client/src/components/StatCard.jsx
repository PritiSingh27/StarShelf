import Card from './ui/Card.jsx';

export default function StatCard({ title, value, icon: Icon }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="p-3 rounded-xl bg-brand-soft text-brand-text">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted">{title}</p>
        <p className="text-2xl font-extrabold text-ink tabular-nums mt-0.5">{value}</p>
      </div>
    </Card>
  );
}
