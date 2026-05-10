import { AppShell } from "../../components/layout/app-shell";
import { SimpleTable } from "../../components/tables/simple-table";
import { CreateOrganizationUnitForm } from "../../components/forms/create-organization-unit-form";

export default function OrganizationPage() {
  return (
    <AppShell>
      <div className="page-header">
        <h1>Organisation</h1>
        <CreateOrganizationUnitForm />
      </div>
      <SimpleTable columns={["Unite", "Type", "Statut"]} rows={[["HCG", "HCG", "ACTIVE"]]} />
    </AppShell>
  );
}
