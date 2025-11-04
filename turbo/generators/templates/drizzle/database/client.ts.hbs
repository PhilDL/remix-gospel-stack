import { createClient as createLibsqlClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../drizzle/schema";

export const createClient = ({
  url,
  syncUrl,
  authToken,
}: {
  url: string;
  syncUrl?: string;
  authToken?: string;
}) => {
  const client = createLibsqlClient({
    url,
    syncUrl,
    authToken,
    syncInterval: syncUrl ? 60 : undefined,
  });

  return drizzle(client, { schema });
};

export type DrizzleClient = ReturnType<typeof createClient>;

