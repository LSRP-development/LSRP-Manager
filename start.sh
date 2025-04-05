#!/bin/sh
git switch main
git pull
pnpm i
npm run build
npm run start
