
export const pubicRoutes = [
    "/",
    "/auth/new-verification",
];

export const authRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/error",
    "/auth/reset",
    "/auth/new-password",
];

export const apiAuthPrefix = "/api/auth";

// Cron routes authenticate with CRON_SECRET themselves, not with a session.
export const cronPrefix = "/api/cron/";

export const adminPrefix = "/admin";

export const DEFAULT_LOGIN_REDIRECT = "/drinks";