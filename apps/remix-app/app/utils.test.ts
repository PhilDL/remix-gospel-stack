import { describe, expect, test } from "vitest";

import { nameInitials } from "./utils.ts";

describe("utils", () => {
  test("nameInitials", () => {
    expect(nameInitials("Philippe L'ATTENTION")).toBe("PL");
    expect(nameInitials("Jean Gabriel de Kervegen")).toBe("JK");
  });
});
