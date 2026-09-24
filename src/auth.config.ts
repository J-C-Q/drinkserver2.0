import bcrypt from "bcryptjs";
import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple"
import {LoginSchema} from "@/schemas";
import {getUserByEmail} from "@/data/user";
import { clientIp, loginAttemptAllowed } from "@/lib/rate-limit";

// Lets the login form tell "too many attempts" apart from a wrong password.
export class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

export default {
  providers: [
    AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: process.env.APPLE_SECRET as string,
    }),
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        issuer: "https://github.com/login/oauth",
    }),
    Credentials({ 
    async authorize(credentials, request) {

    const validatedFields = LoginSchema.safeParse(credentials);
    if (validatedFields.success) {

      const {email,password} = validatedFields.data;

      // Checked here so both the login form and a direct POST to the
      // credentials callback are limited, before any password hashing.
      if (!(await loginAttemptAllowed(email, clientIp(request.headers)))) {
        throw new RateLimitedSignin();
      }

      const user = await getUserByEmail(email);
      if(!user || !user.password) {
        return null;
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            return user;
        }
    }
    return null;
}}
  )
],
  callbacks: {
    // Shared with the middleware so req.auth carries the user id and role.
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig
