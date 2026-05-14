# Checklist déploiement VPS

## Pré-requis serveur

- [ ] Ubuntu 22.04 ou 24.04 LTS
- [ ] 2GB RAM minimum (4GB recommandé)
- [ ] Docker installé (`curl -fsSL https://get.docker.com | sh`)
- [ ] Git installé
- [ ] Firewall configuré (ports 22, 80, 443)

## Déploiement initial

```bash
cd /opt
git clone https://github.com/[repo] gamad-hub
cd gamad-hub
cp .env.example .env
nano .env  # Remplir TOUTES les variables change_me
docker compose -f docker/docker-compose.yml --env-file .env up -d
docker compose -f docker/docker-compose.yml --env-file .env exec api \
  npx prisma migrate deploy --schema prisma/schema.prisma
docker compose -f docker/docker-compose.yml --env-file .env exec api \
  npx tsx prisma/seed.ts
```

## Vérification

```bash
curl http://localhost/api/v1/system/health
# Attendu: {"success":true,"data":{"status":"ok"}}
```

## Mise à jour

```bash
git pull
docker compose -f docker/docker-compose.yml --env-file .env build
docker compose -f docker/docker-compose.yml --env-file .env up -d
docker compose -f docker/docker-compose.yml --env-file .env exec api \
  npx prisma migrate deploy --schema prisma/schema.prisma
```
