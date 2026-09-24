"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError, CredentialsSignin } from "next-auth";

import {signIn} from "@/auth";
import { LoginSchema } from "@/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { generateVerificationToken } from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";
import { clientIp, loginAttemptAllowed, rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return {error: "Invalid fields!"};
    }
    const {email,password} = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    // Same answer for unknown accounts and wrong passwords.
    if (!existingUser || !existingUser.email || !existingUser.password) {
        return {error: "Invalid email or password!"};
    }

    if(!existingUser.emailVerified) {
        // This branch checks the password itself, without the credentials
        // provider, so it applies the same attempt limit first.
        if (!(await loginAttemptAllowed(email, clientIp(await headers())))) {
            return {error: "Too many attempts, please try again later."};
        }
        // Only resend verification mail to someone who knows the password.
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            return {error: "Invalid email or password!"};
        }
        if (!(await rateLimit(`verify:email:${existingUser.email.toLowerCase()}`, 3, 60 * 60))) {
            return {error: "Too many attempts, please try again later."};
        }
        const verificationToken = await generateVerificationToken(existingUser.email);
        const sent = await sendVerificationEmail(verificationToken.email, verificationToken.token);
        if (!sent) {
            return {error: "Could not send the confirmation email, please try again later."};
        }
        return {success: "Confirmation email sent!"}
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT
        })
        return {success: "Loggin in!"};
    } catch (error){
        if(error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    if ((error as CredentialsSignin).code === "rate_limited") {
                        return {error: "Too many attempts, please try again later."};
                    }
                    return {error: "Invalid email or password!"};
                default:
                    return {error: "Something went wrong!"};
            }
        }
        throw error;

    }

    

};