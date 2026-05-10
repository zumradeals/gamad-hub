import { AppShell } from "../../components/layout/app-shell";
import { SimpleTable } from "../../components/tables/simple-table";
import { CreateMemberForm } from "../../components/forms/create-member-form";

export default function MembersPage() {
  return (
    <AppShell>
      <div className="page-header">
        <h1>Membres</h1>
        <CreateMemberForm />
      </div>
      <SimpleTable columns={["GAMAD ID", "Nom", "Statut"]} rows={[["-", "-", "-"]]} />
    </AppShell>
  );
}
