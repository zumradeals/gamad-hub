# ZAHAB STELLAR INTEGRATION v0.1
> Architecture technique d'intégration Stellar — ZAHAB Coin, Anchors, Mobile Money

**Version :** 0.1  
**Statut :** Planification Phase D  
**Couche :** 07-zahab  
**Date :** 2026-05-14

---

## 0. Décision architecturale

**ZAHAB Coin sera émis sur la blockchain Stellar.**

### Pourquoi Stellar et pas TON ou Polygon ?

| Critère | Stellar | TON | Polygon |
|---|---|---|---|
| Frais de transaction | ~$0.00001 | ~$0.001 | Variable (gas) |
| Ecosystem Mobile Money Afrique | Natif (Anchors) | Absent | Absent |
| Stablecoin natif | USDC officiel, XLM | USDT via bridge | USDC, USDT |
| Adossement à l'or | SEP-24 + Anchor custom | Non | Compliqué |
| Vitesse finality | ~5 secondes | ~5 secondes | ~2 secondes |
| Conformité réglementaire | Forte (Anchors réglementés) | Faible | Moyenne |
| Complexité opératoire | Faible | Faible | Haute |
| Governance GAMAD | Totale (issuer account) | Totale | Partielle |

**Conclusion :** Stellar est la blockchain conçue exactement pour les cas d'usage GAMAD :
transfers transfrontaliers, Mobile Money Afrique, stablecoins institutionnels, conformité.

**Note sur TON :** TON est conservé pour la couche **notification/bot Telegram** uniquement.
ZAHAB Coin ne sera PAS émis sur TON.

---

## 1. Architecture Stellar pour ZAHAB Coin

### 1.1 Comptes Stellar GAMAD

```
GAMAD Issuer Account      → Émet tous les ZAHAB Coin
GAMAD Distribution Account → Distribue ZAHAB depuis l'issuer
GAMAD Reserve Account     → Réserve de couverture (XLM + USDC + OR)
User Stellar Accounts     → Créés on-demand lors de la conversion
```

### 1.2 Token ZAHAB Coin

```
Asset Code   : ZAHAB
Asset Issuer : GAMAD Issuer Account (clé publique)
Type         : Custom Asset (Stellar)
Supply       : Contrôlée par GAMAD (issuer lock optionnel)
```

Configuration recommandée de l'issuer :
```
SET_FLAGS: AUTHORIZATION_REQUIRED, AUTHORIZATION_REVOCABLE
Home Domain: gamad.net
TOML: stellar.toml (SEP-1 compliant)
```

### 1.3 Stellar TOML (gamad.net/.well-known/stellar.toml)
```toml
NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
ACCOUNTS=["GAMAD_ISSUER_PUBLIC_KEY"]
VERSION="2.0.0"
SIGNING_KEY="GAMAD_SIGNING_PUBLIC_KEY"

[DOCUMENTATION]
ORG_NAME="GAMAD"
ORG_URL="https://gamad.net"
ORG_LOGO="https://gamad.net/logo.png"
ORG_DESCRIPTION="Infrastructure numérique civilisationnelle"

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

[[VALIDATORS]]
ALIAS="gamad"
DISPLAY_NAME="GAMAD Validator"
HOST="horizon.gamad.net:11625"
PUBLIC_KEY="..."
HISTORY="curl -sf https://gamad.net/stellar-history/{0} -o {1}"
```

---

## 2. Anchors Stellar — Mobile Money Afrique

Un **Anchor Stellar** est une institution qui fait le pont entre ZAHAB Coin et la monnaie locale.

### 2.1 Anchors cibles prioritaires

| Anchor | Région | Rails |
|---|---|---|
| **COWRIE** | Nigeria | Mobile Money NGN |
| **Tempo** | Europe/Afrique | SEPA + Wire |
| **Cowrie Exchange** | Ghana, Kenya, Sénégal | MTN MoMo, Orange Money |
| **Flutterwave** | Pan-Africain | Carte + Mobile |
| **MoneyGram (via Stellar)** | Global | Cash pickup |
| **GAMAD Anchor propre** | Phase E | Souveraineté totale |

### 2.2 Flow de conversion (SEP-24)

```
Utilisateur portail (ZAHAB Points)
  └─ Demande conversion → POST /portal/wallet/convert
       └─ Système crée ZahabTransaction (CONVERSION_REQUEST)
            └─ Backend Stellar mint ZAHAB Coin sur compte user
                 └─ User initie SEP-24 withdrawal avec Anchor
                      └─ Anchor envoie Mobile Money au numéro de l'utilisateur
```

SEP-24 = Interactive Anchor Protocol (Stellar Ecosystem Proposal)
C'est le standard pour le dépôt/retrait interactif vers/depuis les monnaies locales.

### 2.3 Ratio de conversion initial

```
1 ZAHAB Point (portail) = 1 ZAHAB Coin (Stellar)
```

Ce ratio pourra être ajusté par GAMAD selon la politique monétaire.
Initialement : parité 1:1 pour simplifier la communication.

---

## 3. Infrastructure technique Phase D

### 3.1 Services à créer

```
api/core/src/modules/stellar/
  stellar.service.ts        Connexion à Stellar SDK, Horizon API
  stellar.controller.ts     Endpoints conversion, mint, balance
  stellar.module.ts

api/core/src/modules/zahab/
  zahab-stellar.service.ts  Bridge entre ZAHAB Points et ZAHAB Coin
```

### 3.2 SDK et dépendances

```bash
npm install @stellar/stellar-sdk
# SDK officiel Stellar pour Node.js/TypeScript
```

### 3.3 Variables d'environnement à ajouter

```env
STELLAR_NETWORK=mainnet                          # ou testnet
STELLAR_HORIZON_URL=https://horizon.stellar.org
STELLAR_ISSUER_SECRET=S...                       # JAMAIS en code
STELLAR_DISTRIBUTION_SECRET=S...
STELLAR_ASSET_CODE=ZAHAB
STELLAR_ASSET_ISSUER=G...                        # clé publique issuer
```

### 3.4 Opérations Stellar fondamentales

```typescript
// Mint ZAHAB Coin vers un compte utilisateur
async function mintZahab(destinationPublicKey: string, amount: string) {
  const issuerKeypair = Keypair.fromSecret(process.env.STELLAR_ISSUER_SECRET);
  const zahabAsset = new Asset('ZAHAB', issuerKeypair.publicKey());

  const transaction = new TransactionBuilder(issuerAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.PUBLIC,
  })
    .addOperation(Operation.payment({
      destination: destinationPublicKey,
      asset: zahabAsset,
      amount: amount,
    }))
    .setTimeout(30)
    .build();

  transaction.sign(issuerKeypair);
  return server.submitTransaction(transaction);
}
```

---

## 4. Sécurité et garde des clés

### 4.1 Stratégie clés Stellar

| Compte | Stockage | Rotation |
|---|---|---|
| Issuer | HSM ou vault chiffré hors-ligne | Jamais (ou avec multisig) |
| Distribution | HSM ou vault chiffré | Annuelle |
| Reserve | Multisig (3 of 5 HCG) | Sur incident |

### 4.2 Multisig sur l'issuer (recommandé)

Configurer l'issuer avec multisig M-of-N :
- 3 signatures HCG requises pour toute émission
- Évite la compromission totale si une clé est volée

### 4.3 Audit des émissions

Toute émission ZAHAB Coin doit correspondre à une `ZahabTransaction` en base.
Un script de réconciliation vérifie la cohérence mensuelle.

---

## 5. ZAHAB gold-backed — vision long terme

### 5.1 Principe

GAMAD maintient une réserve physique d'or (ou équivalent certifié) couvrant a minima 10% de la supply ZAHAB Coin en circulation, avec un objectif de 100% à terme.

### 5.2 Mécanisme

```
Revenus services GAMAD → achats XAU physique ou PAXG (or tokenisé)
↓
Réserve certifiée annuellement par auditeur externe
↓
Attestation publiée sur gamad.net/zahab/reserve
↓
Trust des utilisateurs et partenaires Anchors
```

### 5.3 Calendrier indicatif

| Horizon | Milestone |
|---|---|
| Phase D | Testnet Stellar, conversions pilotes |
| Phase E | Mainnet, premiers Anchors, couverture 10% |
| Phase F | Couverture 50%, partenariat auditeur |
| Horizon | Couverture 100%, stablecoin gold-backed certifié |

---

## 6. Telegram / TON (rôle distinct)

**TON n'est pas utilisé pour ZAHAB Coin.**

TON est utilisé pour la **couche notification/bot** :
- Bot Telegram GAMAD : alertes, notifications de récompenses, updates wallet
- Pas de transactions financières via TON
- Pas de smart contracts GAMAD sur TON

```
GAMAD Telegram Bot (TON ecosystem)
  └─ Notification : "Tu as reçu +5 ZAHAB pour ta publication !"
  └─ Notification : "Ta candidature est en cours d'examen."
  └─ Lien → gamad.net/dashboard/wallet
```

---

## 7. Conformité et réglementation

### 7.1 KYC/AML

Avant toute conversion ZAHAB Points → ZAHAB Coin, l'utilisateur devra :
1. Vérifier son identité (document + selfie)
2. Confirmer son pays de résidence
3. Accepter les CGU ZAHAB

Les Anchors Stellar disposent de leur propre processus KYC (SEP-12).

### 7.2 Limites de conversion initiales

| Niveau utilisateur | Limite mensuelle |
|---|---|
| NEWCOMER | Non éligible |
| MEMBER | 50 ZAHAB/mois |
| TRUSTED | 500 ZAHAB/mois |
| VETERAN | 5 000 ZAHAB/mois |
| GUARDIAN | Illimité (sous validation HCG) |

### 7.3 Pays prioritaires Phase D

Sénégal, Côte d'Ivoire, Mali, Cameroun, Congo, Niger, Guinée — Mobile Money pénétrant.
France, Belgique, Canada — Diaspora africaine, virements SEPA.
