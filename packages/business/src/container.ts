import "reflect-metadata";
import { container, Lifecycle } from "tsyringe";
import { prisma } from "@my-company/database";
import { PrismaUserRepository } from "./repositories/user-repository";

container.register("PrismaClient", {
  useValue: prisma,
});

container.register("UserRepository", { useClass: PrismaUserRepository }, { lifecycle: Lifecycle.Singleton });

export { container };
