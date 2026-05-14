# Configuration Nginx — GAMAD HUB 2.0

Deux configs disponibles dans `infra/nginx/` :

| Fichier | Usage |
|---|---|
| `gamad-hub.conf` | HTTP uniquement (développement, pre-prod) |
| `gamad-hub-tls.conf` | HTTP + HTTPS avec Let's Encrypt (production) |

## Routage

| Domaine | Service Docker | Port interne |
|---|---|---|
| gamad.net | portal | 3001 |
| hub.gamad.net | core | 3000 |
| *.gamad.net/api/* | api | 4000 |

## HTTPS — Let's Encrypt

```bash
certbot certonly --webroot -w /var/www/certbot \
  -d gamad.net -d www.gamad.net \
  -d hub.gamad.net -d www.hub.gamad.net
```

Après obtention du certificat, basculer sur la config TLS :
```bash
# Dans .env
NGINX_CONF_FILE=gamad-hub-tls.conf
docker compose -f docker/docker-compose.yml --env-file .env up -d nginx
```

## Résolution DNS dynamique

Le `resolver 127.0.0.11` (DNS interne Docker) avec `valid=10s` évite
les 502 après recréation de conteneurs sans redémarrage Nginx.
