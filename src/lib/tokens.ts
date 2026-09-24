import {db} from '@/lib/db';
import { createToken, hashToken } from '@/lib/token-hash';

const TOKEN_LIFETIME_MS = 3600 * 1000;

// Returns the plain token for the email link; only its hash is stored.
export const generateVerificationToken = async (email: string) => {
    const token = createToken();
    const expires = new Date(Date.now() + TOKEN_LIFETIME_MS);

    await db.verificationToken.deleteMany({ where: { email } });
    await db.verificationToken.create({
        data: { email, tokenHash: hashToken(token), expires }
    });
    return { email, token, expires };
}

export const generatePasswordResetToken = async (email: string) => {
    const token = createToken();
    const expires = new Date(Date.now() + TOKEN_LIFETIME_MS);

    await db.passwordResetToken.deleteMany({ where: { email } });
    await db.passwordResetToken.create({
        data: { email, tokenHash: hashToken(token), expires }
    });
    return { email, token, expires };
}
