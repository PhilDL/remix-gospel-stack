import { SalesPerson, SalesPersonDirectory } from "../types.ts";

export function lookUpSalesPersonForZipcode(
  zipcode: string,
  salesPersonDirectory: SalesPersonDirectory
): SalesPerson | undefined {
  for (const salesPerson of salesPersonDirectory) {
    if (new RegExp(salesPerson.zipcodes.join("|^"), "gi").test(zipcode)) {
      return { name: salesPerson.name, email: salesPerson.email };
    }
  }
  return undefined;
}
