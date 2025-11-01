import { PrismaLibSQL } from "@prisma/adapter-libsql";

import { PrismaClient } from "./generated/client";

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
