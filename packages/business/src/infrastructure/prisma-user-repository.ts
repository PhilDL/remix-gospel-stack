import type { PrismaClient } from "@react-router-gospel-stack/database";

import type { UserRepository } from "../repositories/user-repository.ts";

export const PrismaUserRepository = (prisma: PrismaClient): UserRepository => ({
  getUsers: async () => prisma.user.findMany(),
  getUsersCount: async () => prisma.user.count(),
});
