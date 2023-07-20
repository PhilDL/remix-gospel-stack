export type SalesPersonDirectory = Array<{
  name: string;
  email: string;
  zipcodes: string[];
}>;
export type SalesPerson = Omit<SalesPersonDirectory[0], "zipcodes">;
