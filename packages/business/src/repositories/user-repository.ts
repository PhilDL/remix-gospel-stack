
import type { PrismaClient } from "@remix-gospel-stack/database";

import type { User } from "../shared/dtos";
import type { UserRepository } from "./iuser-repository";


export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {
    this.prisma = prisma;
  }
  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUsersCount(): Promise<number> {
    return this.prisma.user.count();
  }
}
