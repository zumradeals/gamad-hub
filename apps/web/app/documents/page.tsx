import { AppShell } from "../../components/layout/app-shell";
import { SimpleTable } from "../../components/tables/simple-table";

export default function DocumentsPage() {
  return (
    <AppShell>
      <div className="page-header"><h1>Documents</h1></div>
      <SimpleTable columns={["Titre", "Classification", "Statut"]} rows={[["-", "-", "-"]]} />
    </AppShell>
  );
}
