declare type User = {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
};

interface UserRepository {
    getUsers(): Promise<User[]>;
}

declare const Service: {
    userRepository: UserRepository;
};

export { Service };
