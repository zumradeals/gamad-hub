import { AppShell } from "../../components/layout/app-shell";
import { SimpleTable } from "../../components/tables/simple-table";

export default function MembersPage() {
  return (
    <AppShell>
      <div className="page-header"><h1>Membres</h1></div>
      <SimpleTable columns={["GAMAD ID", "Nom", "Statut"]} rows={[["-", "-", "-"]]} />
    </AppShell>
  );
}
