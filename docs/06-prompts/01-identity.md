# Prompt 01 — Identity + Auth JWT

> Lire CLAUDE.md et docs/01-core/gamad-hub-core-specification-v0.1.md avant de commencer.

---

## Ce que tu construis

Le système d'identité complet. C'est le fondement de tout le reste.
Sans Identity, aucun autre module ne peut fonctionner.

Le GAMAD ID n'est pas un compte. C'est une existence reconnue.

---

## Backend — api/core/src/modules/identity/

### Endpoints AuthController (POST /api/v1/auth/...)

```
POST /api/v1/auth/login
  Body: { email: string, password: string }
  Return: { token: string, expiresAt: string, citizen: CitizenContext }
  CitizenContext: { gamadId, publicCode, displayName, level, memberships[], roles[] }
  level calculé: PENDING=1, ACTIVE=2, rôle RESPONSABLE_*=3, rôle HCG=4

POST /api/v1/auth/refresh
  Header: Authorization: Bearer <token>
  Return: nouveau token

GET /api/v1/auth/me
  Header: Authorization: Bearer <token>
  Return: CitizenContext complet
```

### Endpoints IdentityController (GET/POST /api/v1/identity/...)

```
POST /api/v1/identity/gamad-ids
  Body: CreateGamadIdDto
  Crée GamadId (PENDING) + Account + Profile
  Génère publicCode unique (format: GMD-XXXXXXXX)
  AuditEvent: GAMAD_ID_CREATED

GET /api/v1/identity/gamad-ids
  Query: skip, take, status, search
  Return: { items[], total, skip, take }

GET /api/v1/identity/gamad-ids/:id
  Return: GamadId complet + Account + Profile + Memberships + Roles

POST /api/v1/identity/gamad-ids/:id/validate
  Body: { decisionNote: string }
  Passe status: PENDING -> ACTIVE
  AuditEvent: MEMBER_VALIDATED

POST /api/v1/identity/gamad-ids/:id/suspend
  Body: { reason: string }
  Passe status: ACTIVE -> SUSPENDED
  AuditEvent: MEMBER_SUSPENDED
```

### Endpoints ProfileController (GET/PATCH /api/v1/profiles/...)

```
GET /api/v1/profiles/:gamadId
PATCH /api/v1/profiles/:gamadId
  Body: UpdateProfileDto
  AuditEvent: PROFILE_UPDATED
```

### Règles absolues identity

- Le token JWT est signé avec process.env.JWT_SECRET via jsonwebtoken
- Expiration : process.env.JWT_EXPIRES_IN (défaut 24h)
- Le password est hashé avec bcrypt (saltRounds=12)
- Le publicCode est unique et généré automatiquement — jamais saisi
- Un GAMAD ID PENDING ne peut pas se connecter au CORE (retourner 403 clair)
- Toute action sur une identité produit un AuditEvent

### DTOs

```typescript
// CreateGamadIdDto
{ displayName: string, email: string, phone: string, password: string,
  identityType: 'PERSON' | 'ORGANIZATION' | 'SYSTEM' }

// UpdateProfileDto
{ firstName?: string, lastName?: string, displayName?: string,
  bio?: string, country?: string, city?: string, visibility?: 'PUBLIC' | 'INTERNAL' | 'PRIVATE' }

// LoginDto
{ email: string, password: string }
```

---

## Permission guard

Créer `api/core/src/common/guards/permission.guard.ts` :
- Lit le header `Authorization: Bearer <token>`
- Vérifie le token avec jsonwebtoken
- Extrait le gamadId du payload
- L'injecte dans `request['actorId']`
- Si token invalide ou expiré : 401 UnauthorizedException
- Si citoyen SUSPENDED ou BANNED : 403 ForbiddenException

---

## Commit attendu

```
feat(identity): système identité complet — GAMAD ID, auth JWT, profils
```

Push sur main.
