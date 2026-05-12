"use client";

import { useCallback, useEffect, useState } from "react";
import { identityApi } from "../../lib/api-client";
import { CreateMemberForm } from "../forms/create-member-form";
import { SimpleTable } from "../tables/simple-table";

export function MembersWorkspace() {
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { items } = await identityApi.listGamadIds({ take: 200 });
      setRows(
        items.length
          ? items.map((m) => [m.publicCode, m.displayName, m.email, m.status])
          : []
      );
    } catch {
      setError("Impossible de charger la liste des membres. Verifiez la session et la permission identity.read.");
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
        <h1>Membres</h1>
        <CreateMemberForm onCreated={load} />
      </div>
      {loading ? <p className="panel">Chargement...</p> : null}
      {error ? <p role="alert" className="api-alert api-alert-error">{error}</p> : null}
      {!loading && !error && rows.length === 0 ? (
        <section className="panel">
          <p>Aucun GAMAD ID pour l’instant. Creez un premier membre ci-dessus.</p>
        </section>
      ) : null}
      {!loading && rows.length > 0 ? (
        <SimpleTable columns={["Code public", "Nom affiche", "Email", "Statut"]} rows={rows} />
      ) : null}
    </>
  );
}
