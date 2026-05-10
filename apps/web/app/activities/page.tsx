import { AppShell } from "../../components/layout/app-shell";
import { SimpleTable } from "../../components/tables/simple-table";

export default function ActivitiesPage() {
  return (
    <AppShell>
      <div className="page-header"><h1>Activites</h1></div>
      <SimpleTable columns={["Titre", "Priorite", "Statut"]} rows={[["-", "-", "-"]]} />
    </AppShell>
  );
}
