# Render Backend Deployment

This project is ready to deploy the backend as a Render Node web service.

## Service Settings

- Root directory: `backend`
- Build command: `npm ci --omit=dev`
- Start command: `npm start`
- Health check path: `/healthz`
- Runtime: Node 20

The root `render.yaml` includes a backend service named `alfanio-backend`.

## Required Render Environment Variables

Set these in the Render dashboard. Do not commit real secrets to the repo.

```text
NODE_ENV=production
RENDER=true
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.example.mongodb.net/Alfanio?retryWrites=true&w=majority
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=alfanioindia@gmail.com
EMAIL_FROM_NAME=Alfanio India
CLIENT_URL=https://alfanio.in
FRONTEND_URL=https://alfanio.onrender.com
JWT_SECRET=use_a_long_random_value
COOKIE_SECRET=use_a_long_random_value
```

The server listens on `process.env.PORT` and falls back to Render's default web-service port `10000` in production.

## Pre-deploy Checks

From the `backend` directory:

```bash
npm run check
npm run test:mongodb
```

After deploy, verify:

```text
https://alfanio-backend.onrender.com/healthz
https://alfanio-backend.onrender.com/api/health
```

`/healthz` should return status `ok`. `/api/health` should show `mongoConnection: "connected"` after MongoDB Atlas credentials are set correctly.

## Security Note

Real MongoDB and email credentials were previously present in production env files. Rotate the MongoDB Atlas password and Gmail app password before deploying.
