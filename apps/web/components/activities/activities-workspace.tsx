"use client";

import { useCallback, useEffect, useState } from "react";
import { activitiesApi } from "../../lib/api-client";
import { CreateActivityForm } from "../forms/create-activity-form";
import { SimpleTable } from "../tables/simple-table";

export function ActivitiesWorkspace() {
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { items } = await activitiesApi.listActivities({ take: 200 });
      setRows(
        items.length
          ? items.map((a) => [
              a.title,
              a.priority.toLowerCase(),
              a.status.toLowerCase(),
              a.organizationUnit?.name ?? "—",
              a.owner?.profile?.displayName ?? "—",
              String(a._count.tasks)
            ])
          : []
      );
    } catch {
      setError("Impossible de charger les activités.");
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
        <h1>Activités</h1>
        <CreateActivityForm onCreated={load} />
      </div>
      {loading ? <p className="panel">Chargement...</p> : null}
      {error ? <p role="alert" className="api-alert api-alert-error">{error}</p> : null}
      {!loading && !error && rows.length === 0 ? (
        <section className="panel">
          <p>Aucune activité pour l&rsquo;instant. Créez une première activité ci-dessus.</p>
        </section>
      ) : null}
      {!loading && rows.length > 0 ? (
        <SimpleTable columns={["Titre", "Priorité", "Statut", "Structure", "Responsable", "Tâches"]} rows={rows} />
      ) : null}
    </>
  );
}
