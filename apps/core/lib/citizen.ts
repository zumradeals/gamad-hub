export interface CitizenContext {
  gamadId: string;
  publicCode: string;
  displayName: string;
  level: number;
  roles: string[];
}

export function getCitizen(): CitizenContext | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('gamadCitizen');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setCitizen(ctx: CitizenContext) {
  localStorage.setItem('gamadCitizen', JSON.stringify(ctx));
}

export function clearSession() {
  localStorage.removeItem('gamadToken');
  localStorage.removeItem('gamadCitizen');
}

export function levelLabel(level: number): string {
  if (level >= 4) return 'Niveau 4 — HCG';
  if (level === 3) return 'Niveau 3 — RESPONSABLE';
  if (level === 2) return 'Niveau 2 — ACTIF';
  return 'Niveau 1 — EN ATTENTE';
}

export function levelColor(level: number): string {
  if (level >= 4) return '#a78bfa';
  if (level === 3) return '#60a5fa';
  if (level === 2) return '#34d399';
  return '#f59e0b';
}

export function levelBg(level: number): string {
  if (level >= 4) return 'rgba(167,139,250,0.1)';
  if (level === 3) return 'rgba(96,165,250,0.1)';
  if (level === 2) return 'rgba(52,211,153,0.1)';
  return 'rgba(245,158,11,0.1)';
}
