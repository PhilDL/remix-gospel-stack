#!/bin/bash

set -ex

# Setup 512MB of space for swap and set permissions and turn on swapmode
fallocate -l 512MB /swapfile
chmod 0600 /swapfile
mkswap /swapfile
echo 10 > /proc/sys/vm/swappiness
swapon /swapfile

npx --yes prisma migrate deploy --schema packages/database/prisma/schema.prisma