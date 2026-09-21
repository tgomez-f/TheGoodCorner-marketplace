#!/bin/sh
set -e 
echo -e " Starting back container initialization sequence up !"

npx prisma generate --schema=./dist/prisma/schema.prisma
npx prisma db push --schema=./dist/prisma/schema.prisma

node dist/prisma/seed.js

exec "$@"