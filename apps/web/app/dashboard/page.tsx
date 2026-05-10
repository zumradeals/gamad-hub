import { AppShell } from "../../components/layout/app-shell";
import { StatusBadge } from "../../components/ui/status-badge";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="page-header">
        <h1>Tableau de bord</h1>
        <StatusBadge value="MVP CORE" />
      </div>
      <div className="grid">
        <div className="metric">Identites actives<strong>0</strong></div>
        <div className="metric">Structures suivies<strong>0</strong></div>
        <div className="metric">Documents recents<strong>0</strong></div>
        <div className="metric">Activites en cours<strong>0</strong></div>
      </div>
    </AppShell>
  );
}
