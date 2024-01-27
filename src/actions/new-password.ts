"use server";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { NewPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";

export const newPassword = async (values: z.infer<typeof NewPasswordSchema>,token?: string | null) => {
    if(!token) {
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

    await db.user.update({
        where: {id: existingUser.id},
        data: {password: hashedPassword}
    });

    await db.passwordResetToken.delete({
        where: {id: existingToken.id}
    });

    return {success: "Password updated!", code: 200};


};
