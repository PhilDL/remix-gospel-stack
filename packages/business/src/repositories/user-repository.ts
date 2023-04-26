import { autoInjectable, container } from "tsyringe";

import type { PrismaClient } from "@remix-gospel-stack/database";

import type { User } from "../shared/dtos";
import type { UserRepository } from "./iuser-repository";

@autoInjectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {
    this.prisma = container.resolve("PrismaClient");
  }
  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUsersCount(): Promise<number> {
    return this.prisma.user.count();
  }
}
