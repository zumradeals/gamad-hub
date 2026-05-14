# Prompt 14 — Phase D : Intégration Stellar — ZAHAB Coin

> Objectif : Émettre ZAHAB Coin sur la blockchain Stellar, connecter les Anchors Mobile Money,
> et permettre la conversion ZAHAB Points → ZAHAB Coin → monnaie locale.

---

## Contexte

Les ZAHAB Points circulent sur le portail depuis Phase A.
Les utilisateurs ont accumulé des ZAHAB mais ne peuvent pas encore les convertir.
Phase D connecte l'économie interne GAMAD à la blockchain Stellar et aux services Mobile Money.

Lire impérativement avant de commencer :
- `docs/07-zahab/zahab-specification-v0.1.md`
- `docs/07-zahab/zahab-stellar-integration-v0.1.md`

---

## Ce que tu dois construire

### A. Infrastructure Stellar

#### 1. Créer les comptes Stellar (opération manuelle pré-déploiement)

Sur Stellar Testnet d'abord :
```bash
# Générer les keypairs
stellar-sdk: Keypair.random()

# Comptes à créer :
# - GAMAD_ISSUER (émet ZAHAB)
# - GAMAD_DISTRIBUTION (distribue)
# - GAMAD_RESERVE (réserve de couverture)

# Alimenter en XLM (minimum 1 XLM par compte sur mainnet)
# Configurer le trustline ZAHAB sur le compte DISTRIBUTION
```

#### 2. stellar.toml (apps/portal/public/.well-known/stellar.toml)

```toml
NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
ACCOUNTS=["GAMAD_ISSUER_PUBLIC_KEY"]
VERSION="2.0.0"
SIGNING_KEY="GAMAD_SIGNING_PUBLIC_KEY"

[DOCUMENTATION]
ORG_NAME="GAMAD"
ORG_URL="https://gamad.net"
ORG_LOGO="https://gamad.net/logo.png"
ORG_DESCRIPTION="Infrastructure numérique civilisationnelle GAMAD"

[[CURRENCIES]]
code="ZAHAB"
issuer="GAMAD_ISSUER_PUBLIC_KEY"
display_decimals=2
name="ZAHAB"
desc="Monnaie officielle de l'écosystème GAMAD"
is_asset_anchored=true
anchor_asset_type="gold"
anchor_asset="XAU"
attestation_of_reserve="https://gamad.net/zahab/reserve"
```

### B. Backend — NestJS

#### 1. Module `stellar`

```
api/core/src/modules/stellar/
  stellar.service.ts
  stellar.module.ts
```

```typescript
// stellar.service.ts — opérations fondamentales
@Injectable()
export class StellarService {
  private server: Horizon.Server;
  private issuerKeypair: Keypair;
  private zahabAsset: Asset;

  async getOrCreateUserAccount(publicKey: string): Promise<AccountResponse>
  async mintToUser(publicKey: string, amount: string): Promise<SubmitTransactionResponse>
  async getUserBalance(publicKey: string): Promise<string>
  async verifyAccount(publicKey: string): Promise<boolean>
}
```

Installer : `npm install @stellar/stellar-sdk`

#### 2. Module `zahab-conversion`

```
api/core/src/modules/zahab/
  zahab-conversion.service.ts
  zahab-conversion.controller.ts
  dto/conversion-request.dto.ts
  dto/link-stellar.dto.ts
```

**Endpoints :**
```
POST /portal/wallet/link-stellar       Lier un compte Stellar à son profil
GET  /portal/wallet/stellar-balance    Solde ZAHAB Coin sur Stellar
POST /portal/wallet/convert            Demander conversion Points → Coin
GET  /portal/wallet/conversions        Historique conversions
```

**Modèle de conversion :**
```prisma
model ZahabConversion {
  id              String           @id @default(uuid())
  gamadId         String
  stellarPublicKey String
  pointsAmount    Decimal          @db.Decimal(18, 8)
  coinAmount      Decimal          @db.Decimal(18, 8)
  status          ConversionStatus @default(PENDING)
  txHash          String?          // Hash transaction Stellar
  createdAt       DateTime         @default(now())
  completedAt     DateTime?

  owner           GamadId          @relation(fields: [gamadId], references: [id])
}

enum ConversionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

**Logique de conversion :**
```typescript
async requestConversion(gamadId: string, amount: number) {
  // 1. Vérifier limits par TrustLevel
  // 2. Vérifier solde Points suffisant
  // 3. Vérifier KYC (Phase D : niveau minimal requis)
  // 4. Créer ZahabConversion (PENDING)
  // 5. Débiter ZAHAB Points (ZahabTransaction: CONVERSION_REQUEST)
  // 6. Mint ZAHAB Coin sur compte Stellar user
  // 7. Mettre à jour ZahabConversion (COMPLETED, txHash)
}
```

#### 3. Limites par TrustLevel (à appliquer dans le service)

```typescript
const CONVERSION_LIMITS: Record<TrustLevel, number> = {
  NEWCOMER: 0,        // Non éligible
  MEMBER: 50,         // 50 ZAHAB/mois
  TRUSTED: 500,
  VETERAN: 5000,
  GUARDIAN: Infinity,
};
```

#### 4. Variables d'environnement à ajouter

```env
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_ISSUER_SECRET=S_ISSUER_SECRET_KEY
STELLAR_DISTRIBUTION_SECRET=S_DISTRIBUTION_SECRET_KEY
STELLAR_ASSET_CODE=ZAHAB
STELLAR_ASSET_ISSUER=G_ISSUER_PUBLIC_KEY
```

Ne JAMAIS committer ces valeurs. Elles vont dans `.env.local` et dans les secrets Docker.

### C. Frontend — apps/portal

#### 1. Section Stellar dans /dashboard/wallet

Ajouter une section "ZAHAB Coin" sous le wallet :

```
apps/portal/app/dashboard/wallet/page.tsx — étendre la page existante
```

Nouvelle section :
- **Lier un compte Stellar** : champ clé publique + bouton "Lier"
- **Solde ZAHAB Coin** : affiché si compte lié (requête Stellar)
- **Bouton "Convertir"** : ouvre modal de conversion
  - Montant à convertir
  - Récapitulatif (frais, montant reçu)
  - Confirmation
- **Historique conversions** : liste avec statut (PENDING/COMPLETED/FAILED)

#### 2. Page /zahab/reserve (publique)

```
apps/portal/app/zahab/reserve/page.tsx
```

Page de transparence réserve GAMAD :
- Supply totale ZAHAB Coin (via Stellar API)
- Réserve déclarée GAMAD
- Date dernier audit
- Lien vers stellar.toml

---

## Règles techniques

- Utiliser Stellar Testnet pendant tout le développement.
- La clé secrète issuer ne transite JAMAIS dans le code applicatif — uniquement variables d'environnement.
- Chaque mint crée une `ZahabConversion` + `ZahabTransaction` en base pour la traçabilité.
- En cas d'échec du mint Stellar, les points sont remboursés (transaction MANUAL_CREDIT inverse).
- Le processus de conversion est idempotent : vérifier avant de soumettre à Stellar.
- Les réponses Stellar peuvent prendre jusqu'à 30s — utiliser des webhooks/polling pour le statut.

---

## Flow SEP-24 (pour les Anchors — implémentation future)

```
1. User initie withdrawal SEP-24 depuis son wallet Stellar
2. Anchor redirige vers page interactive GAMAD (SEP-24 interactive flow)
3. GAMAD vérifie KYC + limites
4. Anchor envoie Mobile Money au numéro enregistré
5. ZAHAB Coin débités du compte Stellar user
```

L'intégration Anchor complète est hors scope Phase D mais l'architecture doit le permettre.
Phase D = testnet + mint. Phase E = Anchors + Mobile Money.

---

## Tests à effectuer

1. Créer compte testnet, lier à un profil portail
2. Convertir 10 ZAHAB Points → 10 ZAHAB Coin (testnet)
3. Vérifier le hash de transaction sur Stellar Expert (testnet)
4. Simuler échec Stellar → vérifier remboursement points
5. Tester les limites par TrustLevel
6. Vérifier stellar.toml accessible via https://gamad.net/.well-known/stellar.toml

---

## Critères de succès

- [ ] ZAHAB Coin émis sur Stellar Testnet
- [ ] Mint fonctionnel depuis le backend NestJS
- [ ] Conversion Points → Coin tracée en base ET sur blockchain
- [ ] stellar.toml publié et valide (SEP-1)
- [ ] Limites de conversion par TrustLevel appliquées
- [ ] Page /zahab/reserve publiée
- [ ] En cas d'échec blockchain, points remboursés automatiquement
