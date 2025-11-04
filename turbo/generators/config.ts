import { execSync } from "child_process";
import fs from "node:fs";
import path from "node:path";
import type { Config } from "@react-router/dev/config";
import type { PlopTypes } from "@turbo/gen";
import { glob } from "glob";
import JSON5 from "json5";
import { loadFile, writeFile } from "magicast";

import { setOrmDatabasePackage } from "./actions/set-orm-database-package";
import { editPackageJson } from "./actions/utils";
import { registerAddInternalPackageGenerator } from "./add-internal-package";
import { registerScaffoldDatabaseGenerator } from "./scaffold-database";

type SupportedDatabases = "postgres" | "turso";
type SupportedOrms = "drizzle" | "prisma";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });
  registerScaffoldDatabaseGenerator(plop);
  registerAddInternalPackageGenerator(plop);
}
