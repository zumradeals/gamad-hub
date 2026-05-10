import { AppShell } from "../../components/layout/app-shell";
import { SimpleTable } from "../../components/tables/simple-table";
import { CreateActivityForm } from "../../components/forms/create-activity-form";

export default function ActivitiesPage() {
  return (
    <AppShell>
      <div className="page-header">
        <h1>Activites</h1>
        <CreateActivityForm />
      </div>
      <SimpleTable columns={["Titre", "Priorite", "Statut"]} rows={[["-", "-", "-"]]} />
    </AppShell>
  );
}
