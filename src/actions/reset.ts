"use server";

import * as z from "zod";

import { ResetSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/tokens";

type ResetResult = {success?: string; error?: string; code: number};

export const reset = async (values: z.infer<typeof ResetSchema>): Promise<ResetResult> => {
    const validatedFields = ResetSchema.safeParse(values);
    if(!validatedFields.success) {
        return {error: "Invalid email!", code: 400};
    }

    const {email} = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    // The response must not reveal whether an account exists.
    const response: ResetResult = {success: "If an account exists for this email, a reset link has been sent.", code: 200};

    if(!existingUser) {
        return response;
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);
    return response;
};