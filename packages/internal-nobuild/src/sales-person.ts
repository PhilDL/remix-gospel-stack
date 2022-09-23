export type SalesPersonDirectory = Array<{
  name: string;
  email: string;
  regexp: RegExp;
}>;
export type SalesPerson = Omit<SalesPersonDirectory[0], "regexp">;

export function lookUpSalesPersonForZipcode(
  zipcode: string,
  salesPersonDirectory: SalesPersonDirectory
): SalesPerson | undefined {
  for (const salesPerson of salesPersonDirectory) {
    if (salesPerson.regexp.test(zipcode)) {
      return { name: salesPerson.name, email: salesPerson.email };
    }
  }
  return undefined;
}
