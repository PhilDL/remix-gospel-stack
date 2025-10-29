import type { User } from "../shared/dtos.ts";

export interface UserRepository {
  getUsers(): Promise<User[]>;
  getUsersCount(): Promise<number>;
}
