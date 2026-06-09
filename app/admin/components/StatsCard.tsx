interface StatsCardProps {
  label: string;
  value: string | number;
  description?: string;
}

export default function StatsCard({ label, value, description }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-navy">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-muted">{description}</p>
      )}
    </div>
  );
}
