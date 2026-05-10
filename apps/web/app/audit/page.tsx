import { AppShell } from "../../components/layout/app-shell";
import { SimpleTable } from "../../components/tables/simple-table";

export default function AuditPage() {
  return (
    <AppShell>
      <div className="page-header"><h1>Audit</h1></div>
      <SimpleTable columns={["Action", "Cible", "Date"]} rows={[["-", "-", "-"]]} />
    </AppShell>
  );
}
