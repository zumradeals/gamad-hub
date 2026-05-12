"use client";

import { useCallback, useEffect, useState } from "react";
import { documentsApi } from "../../lib/api-client";
import { CreateDocumentForm } from "../forms/create-document-form";
import { SimpleTable } from "../tables/simple-table";

export function DocumentsWorkspace() {
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { items } = await documentsApi.listDocuments({ take: 200 });
      setRows(
        items.length
          ? items.map((d) => [
              d.title,
              d.documentType.toLowerCase(),
              d.classification.toLowerCase(),
              d.status.toLowerCase(),
              d.owner?.profile?.displayName ?? "—",
              d.versions?.[0]?.versionNumber ?? "—"
            ])
          : []
      );
    } catch {
      setError("Impossible de charger les documents.");
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
        <h1>Documents</h1>
        <CreateDocumentForm onCreated={load} />
      </div>
      {loading ? <p className="panel">Chargement...</p> : null}
      {error ? <p role="alert" className="api-alert api-alert-error">{error}</p> : null}
      {!loading && !error && rows.length === 0 ? (
        <section className="panel">
          <p>Aucun document pour l&rsquo;instant. Créez un premier document ci-dessus.</p>
        </section>
      ) : null}
      {!loading && rows.length > 0 ? (
        <SimpleTable columns={["Titre", "Type", "Classification", "Statut", "Auteur", "Version"]} rows={rows} />
      ) : null}
    </>
  );
}
