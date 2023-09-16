import "dotenv/config";

import { installGlobals } from "@remix-run/node";

// if (process.env.MOCKS === "true") {
//   await import("./tests/mocks/index.ts");
// }

installGlobals();

if (process.env.NODE_ENV === "production") {
  await import("./server-build/index.js");
} else {
  await import("./server/index.ts");
}
