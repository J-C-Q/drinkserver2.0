import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import {DEFAULT_LOGIN_REDIRECT, adminPrefix, apiAuthPrefix, authRoutes, cronPrefix, pubicRoutes} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const {nextUrl} = req;
  // Require a concrete user id: on an Auth.js config error req.auth can be a
  // truthy error object without a user.
  const isLoggedIn = !!req.auth?.user?.id;
  const isAdmin = isLoggedIn && req.auth?.user?.role === "ADMIN";

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = pubicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname === adminPrefix || nextUrl.pathname.startsWith(`${adminPrefix}/`);

    if (isApiAuthRoute || nextUrl.pathname.startsWith(cronPrefix)) {
        return void 0;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return void 0;
    }

    if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL("/auth/login", nextUrl));
    }

    if (isAdminRoute && !isAdmin) {
        return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    return void 0;
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}