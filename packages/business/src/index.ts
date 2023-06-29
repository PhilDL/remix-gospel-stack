import { PrismaUserRepository } from "./repositories/user-repository";
import { prisma } from "@remix-gospel-stack/database";

export const Service = {
  userRepository: new PrismaUserRepository(prisma),
};

export type { User } from "./shared/dtos";

export { helloWorld } from "./shared/utils";
