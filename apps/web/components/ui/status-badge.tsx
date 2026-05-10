export function StatusBadge({ value }: { value: string }) {
  const tone = value.toLowerCase().replace(/[^a-z_]/g, "-");
  return <span className={`status-badge status-badge-${tone}`}>{value}</span>;
}
