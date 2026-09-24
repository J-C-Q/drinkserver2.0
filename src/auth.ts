import NextAuth, {DefaultSession, Session} from "next-auth"
import {UserRole} from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";


import {db} from "@/lib/db";
import authConfig from "@/auth.config";
import {getUserById} from "@/data/user";
import { JWT } from "next-auth/jwt";

type ExtendedUser = DefaultSession["user"] & {
    role: UserRole;
};

declare module "next-auth" {
    interface Session {
        user: ExtendedUser;
    }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
    ...authConfig,
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    events: {
        async linkAccount({user}) {
            await db.user.update({
                where: {id: user.id},
                data: {emailVerified: new Date()}
            })
        }
    },
    session: { strategy: "jwt" },
    callbacks: {
        ...authConfig.callbacks,
        async signIn( {user, account}) {
            // Allow OAuth without email verification
            if (account?.provider != "credentials") {
                return true;
            }
            const existingUser = await getUserById(user.id as string);

            // Prevent sign in without email verification
            if (!existingUser?.emailVerified) {
                return false;
            }

            // TODO: Add 2FA

            return true;
        },
        async jwt({token, user}) {
            if (user) {
                // Sign-in time as a custom claim: iat is reset whenever the
                // middleware re-encodes the cookie, this claim is kept.
                token.authTime = Date.now();
            }
            if(!token.sub) {
                return token;
            }
            // Fail closed: a deleted user or a failed lookup ends the session
            // instead of keeping the role stored in the cookie.
            let existingUser;
            try {
                existingUser = await db.user.findUnique({
                    where: {id: token.sub},
                    select: {role: true, passwordChangedAt: true},
                });
            } catch (error) {
                console.error("[auth] user lookup failed, ending session:", error);
                return null;
            }

            if (!existingUser) {
                return null;
            }

            // Returning null ends sessions that began before the last password
            // change. Sessions without authTime predate this check.
            if (existingUser.passwordChangedAt) {
                const authTime = typeof token.authTime === "number" ? token.authTime : 0;
                if (authTime < existingUser.passwordChangedAt.getTime()) {
                    return null;
                }
            }

            token.role = existingUser.role;
            return token;
        }
    },
    adapter: PrismaAdapter(db),
})