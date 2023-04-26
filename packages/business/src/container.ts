import "reflect-metadata";
import { Lifecycle, container } from "tsyringe";

import { prisma } from "@remix-gospel-stack/database";

import { PrismaUserRepository } from "./repositories/user-repository";

container.register("PrismaClient", {
  useValue: prisma,
});

container.register(
  "UserRepository",
  { useClass: PrismaUserRepository },
  { lifecycle: Lifecycle.Singleton }
);

export { container };
