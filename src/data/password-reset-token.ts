import {db} from "@/lib/db";
import { hashToken } from "@/lib/token-hash";

export const getPasswordResetTokenByToken = async (token: string) => {
try {
    const passwordResetToken = await db.passwordResetToken.findUnique({
        where: {tokenHash: hashToken(token)}
    });
    return passwordResetToken;
} catch {
    return null;
}
};

export const getPasswordResetTokenByEmail = async (email: string) => {
    try {
        const passwordResetToken = await db.passwordResetToken.findFirst({
            where: {email}
        });
        return passwordResetToken;
    } catch {
        return null;
    }
    };