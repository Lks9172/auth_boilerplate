#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh mysql:3306
npm run start:prod > /dev/null 2>&1 &
npm run lint
npm run test:e2e -- --runInBand
