import { db } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.user.findUnique({ where: { email } });
        return user;
    } catch {
        return null
    }
}

export const getUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({ where: { id } });
        return user;
    } catch {
        return null
    }
}

export const authorizeUser = async (id: string) => {
    try {
        const user = await db.user.update({ where: { id }, data: { authorized: true } });
        return user;
    } catch {
        return null
    }
}

export const unAuthorizeUser = async (id: string) => {
    try {
        const user = await db.user.update({ where: { id }, data: { authorized: false } });
        return user;
    } catch {
        return null
    }
}