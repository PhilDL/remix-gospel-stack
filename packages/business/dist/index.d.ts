declare type User = {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
};

interface UserRepository {
    getUsers(): Promise<User[]>;
}

declare function helloWorld(name?: string): string;

declare const Service: {
    userRepository: UserRepository;
};

export { Service, User, helloWorld };
