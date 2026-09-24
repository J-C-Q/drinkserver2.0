"use server";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { NewPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";

export const newPassword = async (values: z.infer<typeof NewPasswordSchema>,token?: string | null) => {
    if(typeof token !== "string" || token === "") {
        return {error: "Missing token!", code: 400};
    }

    const validatedFields = NewPasswordSchema.safeParse(values);

    if(!validatedFields.success) {
        return {error: "Invalid fields!", code: 400};
    }

    const {password} = validatedFields.data;
    const existingToken = await getPasswordResetTokenByToken(token);

    if(!existingToken) {
        return {error: "Invalid token!", code: 404};
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if(hasExpired) {
        return {error: "Token has expired!", code: 400};
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if(!existingUser) {
        return {error: "Email does not exist!", code: 404};
    }

    const hashedPassword = await bcrypt.hash(password,10);

    // Consume the token and change the password together; the conditional
    // delete lets only one of several concurrent submissions through.
    const updated = await db.$transaction(async (tx) => {
        const consumed = await tx.passwordResetToken.deleteMany({
            where: {id: existingToken.id, expires: {gt: new Date()}}
        });
        if (consumed.count === 0) {
            return false;
        }
        await tx.user.update({
            where: {id: existingUser.id},
            // Signs out sessions that started before the change (see auth.ts).
            data: {password: hashedPassword, passwordChangedAt: new Date()}
        });
        return true;
    });

    if(!updated) {
        return {error: "Invalid token!", code: 404};
    }

    return {success: "Password updated!", code: 200};
};
