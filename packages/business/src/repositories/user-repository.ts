import { autoInjectable, inject } from "tsyringe";
import type { PrismaClient } from "@my-company/database";
import type { UserRepository } from "./iuser-repository";
import type { User } from "../shared/dtos";

@autoInjectable()
export class PrismaUserRepository implements UserRepository {
  constructor(@inject("PrismaClient") private readonly prisma: PrismaClient) {}
  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
