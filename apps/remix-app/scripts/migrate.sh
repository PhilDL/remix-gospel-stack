#!/bin/bash

fallocate -l 256M /swapfile
chmod 0600 /swapfile
mkswap /swapfile
echo 10 >/proc/sys/vm/swappiness
swapon /swapfile
echo 1 >/proc/sys/vm/overcommit_memory
npx prisma migrate deploy --schema packages/database/prisma/schema.prisma
swapoff /swapfile
rm /swapfile