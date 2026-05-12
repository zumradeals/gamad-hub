"use client";

import { useCallback, useEffect, useState } from "react";
import { auditApi } from "../../lib/api-client";
import { SimpleTable } from "../tables/simple-table";

export function AuditWorkspace() {
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { items } = await auditApi.listEvents({ limit: 100 });
      setRows(
        items.length
          ? items.map((e) => [
              e.action,
              e.targetType,
              e.targetId ?? "—",
              e.createdAt ? new Date(e.createdAt).toLocaleString("fr-FR") : "—"
            ])
          : []
      );
    } catch {
      setError("Impossible de charger les événements d'audit.");
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
        <h1>Audit</h1>
      </div>
      {loading ? <p className="panel">Chargement...</p> : null}
      {error ? <p role="alert" className="api-alert api-alert-error">{error}</p> : null}
      {!loading && !error && rows.length === 0 ? (
        <section className="panel">
          <p>Aucun événement d&rsquo;audit pour l&rsquo;instant.</p>
        </section>
      ) : null}
      {!loading && rows.length > 0 ? (
        <SimpleTable columns={["Action", "Type de cible", "ID Cible", "Date"]} rows={rows} />
      ) : null}
    </>
  );
}
