container setup (this was a whole hassle)
```shell
docker run --name roblox-trust-platform-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=IHateKittens2000 -e POSTGRES_DB=roblox_trust_platform -p 5432:5432 -v roblox-trust-platform-db:/var/lib/postgresql postgres:latest
```

```shell
cd server
npx prisma migrate dev
npx prisma generate
```

(env var names)
```
DATABASE_URL
FRONTEND_URL
BACKEND_PORT
SESSION_SECRET
ROBLOX_CLIENT_ID
ROBLOX_CLIENT_SECRET
ROBLOX_REDIRECT_URI
NODE_ENV
POSTGRES_USER
POSTGRES_PASSWORD
```

(on both server and client respectively, run)
```shell
npm install
```

to start:
```shell
cd server
npm run dev

cd client
npm run dev

cd server
npx prisma studio
```