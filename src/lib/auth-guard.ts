import { auth } from "@/auth";

// Returns the signed-in user, or null. Requires a real user id so that a
// malformed or error session object is never treated as authenticated.
export const currentUser = async () => {
    const session = await auth();
    const user = session?.user;
    if (!user?.id) {
        return null;
    }
    return { ...user, id: user.id };
};

export const currentAdmin = async () => {
    const user = await currentUser();
    if (!user || user.role !== "ADMIN") {
        return null;
    }
    return user;
};
