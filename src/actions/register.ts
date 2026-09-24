"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendAccountExistsEmail, sendVerificationEmail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";


export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!", code: 400 };
    }
    const { email, password, name } = validatedFields.data;

    if (!(await rateLimit(`register:ip:${clientIp(await headers())}`, 10, 60 * 60))) {
        return { error: "Too many attempts, please try again later.", code: 429 };
    }
    const hashedPassword = await bcrypt.hash(password, 10);


    const existingUser = await getUserByEmail(email);

    // Same response as a new registration, so the form does not reveal which
    // addresses have accounts; the owner is told by email instead.
    if (existingUser) {
        if (await rateLimit(`register:email:${email.toLowerCase()}`, 3, 60 * 60)) {
            await sendAccountExistsEmail(email);
        }
        return { success: "Confirmation email sent!", code: 200 };
    }

    await db.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    });

    const verificationToken = await generateVerificationToken(email);
    const sent = await sendVerificationEmail(verificationToken.email, verificationToken.token);
    if (!sent) {
        return { error: "Account created, but the confirmation email could not be sent. Log in to resend it.", code: 500 };
    }

    return { success: "Confirmation email sent!", code: 200 }
};