"use client";

import { useCallback, useEffect, useState } from "react";
import { identityApi, organizationApi, documentsApi, activitiesApi } from "../../lib/api-client";
import { StatusBadge } from "../ui/status-badge";

export function DashboardWorkspace() {
  const [identities, setIdentities] = useState(0);
  const [structures, setStructures] = useState(0);
  const [documents, setDocuments] = useState(0);
  const [activities, setActivities] = useState(0);

  const load = useCallback(async () => {
    try {
      const [idResult, orgResult, docResult, actResult] = await Promise.all([
        identityApi.listGamadIds({ take: 1 }),
        organizationApi.listUnits({ take: 1 }),
        documentsApi.listDocuments({ take: 1 }),
        activitiesApi.listActivities({ take: 1 })
      ]);
      setIdentities(idResult.total);
      setStructures(orgResult.total);
      setDocuments(docResult.total);
      setActivities(actResult.total);
    } catch {
      // Silent fail on dashboard
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div className="page-header">
        <h1>Tableau de bord</h1>
        <StatusBadge value="MVP CORE" />
      </div>
      <div className="grid">
        <div className="metric">Identités actives<strong>{identities}</strong></div>
        <div className="metric">Structures suivies<strong>{structures}</strong></div>
        <div className="metric">Documents récents<strong>{documents}</strong></div>
        <div className="metric">Activités en cours<strong>{activities}</strong></div>
      </div>
    </>
  );
}
