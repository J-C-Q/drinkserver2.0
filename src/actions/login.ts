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
    const ip = clientIp(await headers());

    // Bounds the account lookups below per address.
    if (!(await rateLimit(`login-lookup:ip:${ip}`, 100, 15 * 60))) {
        return {error: "Too many attempts, please try again later."};
    }

    const existingUser = await getUserByEmail(email);

    // Unverified accounts are the only case handled here: this branch checks
    // the password itself, so it applies the credentials provider's attempt
    // limit first. Every other case, including unknown addresses, goes through
    // signIn below, which limits and answers them all the same way.
    if (existingUser?.email && existingUser.password && !existingUser.emailVerified) {
        if (!(await loginAttemptAllowed(email, ip))) {
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