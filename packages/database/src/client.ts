import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "./generated/client";

export const createClient = ({ url }: { url: string }) => {
  const adapter = new PrismaBetterSQLite3({
    url,
  });
  return new PrismaClient({ adapter });
};
