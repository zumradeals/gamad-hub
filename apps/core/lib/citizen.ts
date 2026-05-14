export interface CitizenContext {
  gamadId: string;
  publicCode: string;
  displayName: string;
  level: 1 | 2 | 3 | 4;
  memberships: { unitId: string; unitName: string; roleName: string }[];
  roles: string[];
}

export function getCitizen(): CitizenContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('gamadCitizen');
    return raw ? (JSON.parse(raw) as CitizenContext) : null;
  } catch {
    return null;
  }
}

export function setCitizen(ctx: CitizenContext): void {
  localStorage.setItem('gamadCitizen', JSON.stringify(ctx));
}

export function clearSession(): void {
  localStorage.removeItem('gamadToken');
  localStorage.removeItem('gamadCitizen');
}

export function levelLabel(level: number): string {
  if (level >= 4) return 'HCG';
  if (level === 3) return 'RESPONSABLE';
  if (level === 2) return 'ACTIF';
  return 'EN ATTENTE';
}

export function levelColor(level: number): string {
  if (level >= 4) return 'var(--level-hcg)';
  if (level === 3) return 'var(--level-responsable)';
  if (level === 2) return 'var(--level-active)';
  return 'var(--level-pending)';
}

export function levelBg(level: number): string {
  if (level >= 4) return 'rgba(167,139,250,0.12)';
  if (level === 3) return 'rgba(245,158,11,0.12)';
  if (level === 2) return 'rgba(52,211,153,0.12)';
  return 'rgba(96,165,250,0.12)';
}
