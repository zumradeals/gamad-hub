# AGENTS.md

## GAMAD HUB — Operational Doctrine for AI Coding Agents

This repository is not a generic startup application.

It is the sovereign digital foundation of the GAMAD ecosystem.

Agents must prioritize:

* structural coherence;
* long-term maintainability;
* explicit contracts;
* separation of concerns;
* sovereignty;
* auditability;
* continuity.

Never optimize for speed at the expense of architecture.

---

# 1. Core Principles

## 1.1 Source of Truth

The `/docs` directory is the primary architectural source of truth.

If implementation conflicts with documentation:

```text
Documentation wins.
```

---

## 1.2 Strict Layer Separation

Never confuse:

* public portal;
* sovereign CORE;
* ecosystem services;
* infrastructure;
* governance.

The system is intentionally layered.

---

## 1.3 No Feature Drift

Do NOT add:

* blockchain;
* crypto;
* social media mechanics;
* gamification;
* AI orchestration beyond documented scope;
* hidden business logic;
* undocumented services.

Only implement what is explicitly documented.

---

# 2. Documentation Architecture

## 2.1 Foundation Layer

Directory:

```text
/docs/00-foundation/
```

Contains:

* civilization doctrine;
* citizenship doctrine;
* sovereignty doctrine;
* visibility doctrine;
* constitutional principles.

These documents define:

* why the ecosystem exists;
* human structure;
* sovereignty rules;
* continuity principles.

Agents must NEVER contradict these documents.

---

## 2.2 Core Layer

Directory:

```text
/docs/01-core/
```

Contains:

* core specification;
* reference architecture;
* data model;
* permission model;
* event model;
* API contracts;
* MVP scope.

These documents define:

* backend contracts;
* domain entities;
* permissions;
* events;
* APIs;
* audit rules.

The backend must strictly follow this layer.

---

## 2.3 UI Layer

Directory:

```text
/docs/02-ui/
```

Contains:

* design system;
* UI foundation;
* public portal information architecture.

Defines:

* visual doctrine;
* layouts;
* tokens;
* navigation;
* UI structure;
* public portal flows.

Frontend agents must follow this layer.

---

## 2.4 Ecosystem Layer

Directory:

```text
/docs/03-ecosystem/
```

Contains:

* ecosystem architecture;
* public portal specification.

Defines:

* ecosystem relationships;
* service layers;
* satellites;
* public vs sovereign systems;
* GAMAD ID positioning.

---

## 2.5 Build Layer

Directory:

```text
/docs/04-build/
```

Contains:

* build specifications;
* implementation strategy;
* tech stack decisions;
* future public portal build docs.

Defines:

* implementation constraints;
* deployment philosophy;
* stack boundaries.

---

## 2.6 Repository Layer

Directory:

```text
/docs/05-repository/
```

Defines:

* repository structure;
* monorepo organization;
* workspace boundaries.

---

## 2.7 Prompt Layer

Directory:

```text
/docs/06-prompts/
```

Contains:

* operational prompts;
* coding prompts;
* build prompts.

These prompts are implementation accelerators.

They are NOT architectural truth.

---

# 3. Sovereign Architecture Rules

## 3.1 CORE vs Public Portal

The PUBLIC PORTAL:

* is public;
* is discreet;
* presents the ecosystem;
* must NOT expose sovereign structures.

The CORE:

* is sovereign;
* is internal;
* handles governance;
* identity;
* transmission;
* coordination;
* audit.

Never merge these layers.

---

## 3.2 GAMAD ID

GAMAD ID is:

* identity;
* continuity;
* protection;
* ecosystem linkage.

It is NOT just a user account.

Agents must preserve this abstraction.

---

## 3.3 Satellite Services

Some services may:

* use independent branding;
* hide explicit GAMAD affiliation;
* remain connected silently to the ecosystem.

This is intentional.

Do not force centralized branding everywhere.

---

# 4. Backend Rules

Backend authority:

* permissions;
* audit;
* events;
* validation;
* business rules.

Frontend must NEVER become the source of truth.

---

# 5. Frontend Rules

Frontend responsibilities:

* consume APIs;
* display state;
* respect UI doctrine;
* display permissions errors clearly.

Frontend must NOT:

* decide permissions;
* bypass audit;
* embed hidden logic.

---

# 6. Audit Rules

Critical actions must produce:

* audit events;
* traceability;
* timestamps;
* actor linkage.

No silent critical mutation is allowed.

---

# 7. Security Rules

Never:

* commit secrets;
* expose sovereign internals publicly;
* expose governance structures unnecessarily.

Use:

* environment variables;
* explicit permissions;
* role separation.

---

# 8. Repository Structure

Current high-level structure:

```text
apps/
├── web/
├── public-portal/ (future)

api/
├── core/

packages/
├── contracts/
├── shared-types/
├── validators/
├── ui/ (future)
├── design-tokens/ (future)

prisma/
infra/
docker/
scripts/
docs/
```

---

# 9. Public Portal Rules

The public portal must:

* remain calm;
* institutional;
* universal;
* mobile-first;
* lightweight.

It must NOT:

* reveal sovereign internals;
* behave like a social network;
* become a hype landing page.

---

# 10. Long-Term Doctrine

This repository is intended to survive:

* tools;
* frameworks;
* AI agents;
* developers;
* infrastructure changes.

Agents must optimize for:

```text
clarity,
continuity,
reconstructibility,
and sovereignty.
```

---

# 11. Operational Workflow for Agents

Before implementing:

1. Read AGENTS.md
2. Read only the relevant docs layer
3. Produce a plan
4. Implement minimal coherent scope
5. Validate contracts
6. Validate build
7. Validate architecture boundaries

Never implement blindly.

---

# 12. Final Principle

The GAMAD ecosystem is:

```text
A discreet sovereign digital civilization
built for transmission,
continuity,
responsibility,
and human development.
```

All implementation must preserve this direction.
