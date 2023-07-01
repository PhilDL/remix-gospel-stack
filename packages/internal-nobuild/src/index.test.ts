import { describe } from "vitest";

import { internalFunc } from "./index.ts";

describe("Dummy test", () => {
  describe("internalFunc", () => {
    it("should create return a text", async () => {
      expect(internalFunc()).toContain("Internal");
    });
  });
});
