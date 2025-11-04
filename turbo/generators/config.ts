import type { PlopTypes } from "@turbo/gen";

import { registerAddInternalPackageGenerator } from "./add-internal-package";
import { registerScaffoldDatabaseGenerator } from "./scaffold-database";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });
  registerScaffoldDatabaseGenerator(plop);
  registerAddInternalPackageGenerator(plop);
}
