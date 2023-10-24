#!/bin/bash

# MySQL 컨테이너의 IP 주소를 확인합니다.
MYSQL_IP=$(getent hosts mysql | awk '{ print $1 }')

# 환경변수를 설정합니다.
export MYSQL_IP

# .env 수정하는 스크립트
grep -v 'DB_HOST=' .env > .env.tmp
mv .env.tmp .env
echo "DB_HOST=$MYSQL_IP" >> .env

if [ -f .env.tmp ]; then
    rm .env.tmp
fi
unset MYSQL_IP

# 서버 구동
npm start
