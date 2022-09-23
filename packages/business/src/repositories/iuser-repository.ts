import type { User } from "../shared/dtos";

export interface UserRepository {
  getUsers(): Promise<User[]>;
  getUsersCount(): Promise<number>;
}
