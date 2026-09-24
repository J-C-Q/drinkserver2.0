import {Resend} from "resend";

const domain = process.env.NEXT_PUBLIC_APP_URL;

let resend: Resend | null = null;

// Created on first use so a missing API key fails the send, not every module
// that imports this file.
const getResend = () => {
    if (!resend && process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
};

// Returns true only if Resend accepted the email.
const sendEmail = async (to: string, subject: string, html: string) => {
    const client = getResend();
    if (!client) {
        console.error("[mail] RESEND_API_KEY is not set; email not sent:", subject);
        return false;
    }
    try {
        const { error } = await client.emails.send({
            from: "drinkserver@quintenpreiss.de",
            to,
            subject,
            html,
        });
        if (error) {
            console.error("[mail] Resend rejected email:", subject, error);
            return false;
        }
        return true;
    } catch (error) {
        console.error("[mail] Failed to send email:", subject, error);
        return false;
    }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${domain}/auth/new-password?token=${token}`;
    return sendEmail(email, "Reset your password", `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`);
};

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${domain}/auth/new-verification?token=${token}`;
    return sendEmail(email, "Confirm your email", `<p>Click <a href="${confirmLink}">here</a> to confirm your email.</p>`);
};
