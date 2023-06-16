# SOB (Super Omega Bot)

## Setup

- Run `npm install`
- Run `npx prisma db push`
- Copy `.env.example` to `.env` and fill in secrets

## Run project

### Dev docker

Run `docker compose -f docker-compose.dev.yml up -d`

### Run app

Run `npm run dev`

## Filling in credentials

`SLACK_BOT_TOKEN` is found in the "OAuth & Permissions" page of your app

`SLACK_SIGNING_SECRET` is found in the "Basic Information" page of your app

`SLACK_APP_TOKEN` is the found under "App-Level Tokens" on the "Basic Information" page of your app

## Add new group

Add the gamma group to `bot-whitelist.json`
