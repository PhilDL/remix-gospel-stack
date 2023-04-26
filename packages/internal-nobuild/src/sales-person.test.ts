import { describe } from "vitest";

import {
  lookUpSalesPersonForZipcode,
  type SalesPersonDirectory,
} from "./sales-person";

describe("Dummy test", () => {
  describe("lookUpSalesPersonForZipcode", () => {
    const salesPersons: SalesPersonDirectory = [
      {
        name: "mark",
        email: "mark@remix-gospel-stack.com",
        regexp:
          /^01|^73|^74|^05|^38|^69|^42|^43|^07|^26|^04|^06|^83|^13|^84|^30|^07|^48|^12|^2B|^2A/,
      },
      {
        name: "coltrane",
        email: "coltrane@remix-gospel-stack.com",
        regexp:
          /^62|^59|^80|^60|^02|^08|^77|^51|^10|^89|^21|^52|^55|^71|^39|^25|^70|^90|^88|^54|^57|^67|^68/,
      },
      {
        name: "philippe",
        regexp:
          /^33|^24|^16|^17|^87|^23|^36|^18|^41|^37|^86|^79|^85|^86|^18|^58|^03|^23|^63|^15|^19|^23|^87|^19|^46|^15|^46|^82|^81|^34|^66|^11|^09|^31|^32|^65|^64|^40|^47|^82/,
        email: "philippe@remix-gospel-stack.com",
      },
      {
        name: "lance",
        email: "lance@remix-gospel-stack.com",
        regexp:
          /^76|^27|^78|^95|^94|^93|^92|^91|^45|^28|^41|^37|^72|^61|^14|^50|^35|^56|^22|^29|^44|^49|^53/,
      },
      {
        name: "john",
        email: "john@remix-gospel-stack.com",
        regexp: /^974|^976/,
      },
      {
        name: "mike",
        email: "mike@remix-gospel-stack.com",
        regexp: /^971|^972|^973|^975|^984|^986|^987|^988/,
      },
    ];

    it("Should get john", async () => {
      const commercial = lookUpSalesPersonForZipcode("97490", salesPersons);
      expect(commercial).toBeDefined;
      expect(commercial?.name).toBe("john");
    });
    it("Should get undefined", async () => {
      const commercial = lookUpSalesPersonForZipcode("00000", salesPersons);
      expect(commercial).toBeUndefined;
    });
    it("If Zipcode begins with 08 should get coltrane", async () => {
      const commercial = lookUpSalesPersonForZipcode("08490", salesPersons);
      expect(commercial).toBeDefined;
      expect(commercial?.name).toBe("coltrane");
    });
  });
});
