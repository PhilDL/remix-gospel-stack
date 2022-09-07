import { container } from "./container";
import { UserRepository } from "./repositories/iuser-repository";

export const Service = {
  userRepository: container.resolve<UserRepository>("UserRepository"),
};
