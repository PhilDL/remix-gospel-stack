import { faker } from "@faker-js/faker";

import { memoizeUnique } from "./memoize-unique.ts";

// eslint-disable-next-line @typescript-eslint/unbound-method
const unique = memoizeUnique(faker.internet.userName);

export function createUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const username = unique({
    firstName: firstName.toLowerCase(),
    lastName: lastName.toLowerCase(),
  })
    .slice(0, 20)
    .replace(/[^a-z0-9_]/g, "_");
  return {
    // username,
    name: `${firstName} ${lastName}`,
    email: `${username}@example.com`,
  };
}

export function createPassword(_username: string = faker.internet.userName()) {
  return {
    hash: "secret",
  };
}
