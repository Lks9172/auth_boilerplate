#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh mysql:3306 -- echo "MySQL is up"
npm run start:prod
