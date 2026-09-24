import {db } from "@/lib/db";
import { hashToken } from "@/lib/token-hash";

export const getVerificationTokenByToken = async (token: string) => {
    try {
        const verificationToken = await db.verificationToken.findUnique({ where: { tokenHash: hashToken(token) } });
        return verificationToken;
    } catch {
        return null
    }

    }

export const getVerificationTokenByEmail = async (email: string) => {
    try {
        const verificationToken = await db.verificationToken.findFirst({ where: { email } });
        return verificationToken;
    } catch {
        return null
    }

    }