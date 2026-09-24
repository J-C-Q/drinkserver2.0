"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import {signIn} from "@/auth";
import { LoginSchema } from "@/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { generateVerificationToken } from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";

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
        // Only resend verification mail to someone who knows the password.
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            return {error: "Invalid email or password!"};
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
                    return {error: "Invalid email or password!"};
                default:
                    return {error: "Something went wrong!"};
            }
        }
        throw error;

    }

    

};