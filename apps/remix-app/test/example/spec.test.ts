import { describe, expect, it } from "vitest";

import {
  lookUpSalesPersonForZipcode,
  type SalesPersonDirectory,
} from "@remix-gospel-stack/internal-nobuild";

describe("Example test.", () => {
  it("It should pass successfully.", () => {
    const hasPassed = true;
    expect(hasPassed).toBeTruthy();
  });
});

describe("Testing internal package.", () => {
  const salesPersons: SalesPersonDirectory = [
    {
      name: "mark",
      email: "mark@remix-gospel-stack.com",
      regexp:
        /^01|^73|^74|^05|^38|^69|^42|^43|^07|^26|^04|^06|^83|^13|^84|^30|^07|^48|^12|^2B|^2A/,
    },
    { name: "john", email: "john@remix-gospel-stack.com", regexp: /^974|^976/ },
  ];

  it("Should get john", async () => {
    const commercial = lookUpSalesPersonForZipcode("97490", salesPersons);
    expect(commercial).toBeDefined();
    expect(commercial?.name).toBe("john");
  });
});
