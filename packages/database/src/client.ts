import { PrismaLibSQL } from "@prisma/adapter-libsql";

import { PrismaClient } from "./generated/client";

/**
 * Prisma is not really ready for Turso Embedded Replica,
 * you don't have access to the inner libsql client, so
 * you cannot call the initial sync method.
 */
export const createClient = ({
  url,
  syncUrl,
  authToken,
}: {
  url: string;
  syncUrl?: string;
  authToken?: string;
}) => {
  const adapter = new PrismaLibSQL({
    url,
    syncUrl,
    authToken,
    syncInterval: syncUrl ? 60 : undefined,
  });
  return new PrismaClient({ adapter });
};
