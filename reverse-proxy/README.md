# Onvi Reverse Proxy

Reverse proxy for onvi-mobile API that blocks Russian IP addresses and forwards traffic to the backend API.

## Environment Variables

- `PORT` - Server port (default: 3000)
- `BACKEND_URL` - Backend API URL to proxy to (required)

## Usage

```bash
npm install
BACKEND_URL=https://your-api-domain.com npm start
```

## Docker

```bash
docker build -t onvi-reverse-proxy .
docker run -p 3000:3000 -e BACKEND_URL=https://your-api-domain.com onvi-reverse-proxy
```

