"use client";

import { useCallback, useEffect, useState } from "react";
import { organizationApi } from "../../lib/api-client";
import { CreateOrganizationUnitForm } from "../forms/create-organization-unit-form";
import { SimpleTable } from "../tables/simple-table";

export function OrganizationWorkspace() {
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { items } = await organizationApi.listUnits({ take: 200 });
      setRows(
        items.length
          ? items.map((u) => [
              u.name,
              u.type.toLowerCase(),
              u.status.toLowerCase(),
              u.parent?.name ?? "—",
              String(u._count.memberships),
              String(u._count.children)
            ])
          : []
      );
    } catch {
      setError("Impossible de charger les structures.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div className="page-header">
        <h1>Organisation</h1>
        <CreateOrganizationUnitForm onCreated={load} />
      </div>
      {loading ? <p className="panel">Chargement...</p> : null}
      {error ? <p role="alert" className="api-alert api-alert-error">{error}</p> : null}
      {!loading && !error && rows.length === 0 ? (
        <section className="panel">
          <p>Aucune structure pour l&rsquo;instant. Créez une première unité ci-dessus.</p>
        </section>
      ) : null}
      {!loading && rows.length > 0 ? (
        <SimpleTable columns={["Nom", "Type", "Statut", "Parent", "Membres", "Sous-unités"]} rows={rows} />
      ) : null}
    </>
  );
}
