#!/bin/bash

set -ex
npx --yes prisma migrate deploy --schema packages/infrastructure/prisma/schema.prisma