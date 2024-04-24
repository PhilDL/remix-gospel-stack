#!/bin/bash

set -ex
npx --yes prisma migrate deploy --schema packages/database/prisma/schema.prisma