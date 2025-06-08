import { getCustomClaims, USER_TYPE, type CustomClaims } from '$lib/utils/supabaseUtils';
import type { User } from '@supabase/supabase-js';
import { redirect, type Handle } from '@sveltejs/kit';

const ROUTE_GROUPS = {
    NO_USER: ["/", "/auth"],
    NOT_WHITELISTED: ["/profile", "/requests"],
    BASE: ["/dashboard"],
    HELPER: ["/helper-panel"],
    ADMIN: ["/admin-panel"]
} as const;


const ACCESS_LEVEL = {
    NO_USER: 0,
    NOT_WHITELISTED: 1,
    BASE: 2,
    HELPER: 3,
    ADMIN: 4,
} as const;
type AccessLevel = typeof ACCESS_LEVEL[keyof typeof ACCESS_LEVEL];


const getUserAccessLevel = (customClaims: CustomClaims | null): AccessLevel => {
    if (!customClaims) return ACCESS_LEVEL.NO_USER;
    if (!customClaims.is_whitelisted) return ACCESS_LEVEL.NOT_WHITELISTED;

    switch (customClaims.type) {
        case USER_TYPE.ADMIN: return ACCESS_LEVEL.ADMIN;
        case USER_TYPE.HELPER: return ACCESS_LEVEL.HELPER;
        case USER_TYPE.BASE: return ACCESS_LEVEL.BASE;
    }
}

const getAccessibleRoutes = (user: User | null): string[] => {
    const customClaims = getCustomClaims(user);
    const accessLevel = getUserAccessLevel(customClaims);

    const routes: string[] = [];

    // hierarchical access - each level includes all lower levels
    switch (accessLevel) {
        case ACCESS_LEVEL.ADMIN:
            routes.push(...ROUTE_GROUPS.ADMIN);
        case ACCESS_LEVEL.HELPER:
            routes.push(...ROUTE_GROUPS.HELPER);
        case ACCESS_LEVEL.BASE:
            routes.push(...ROUTE_GROUPS.BASE);
        case ACCESS_LEVEL.NOT_WHITELISTED:
            routes.push(...ROUTE_GROUPS.NOT_WHITELISTED);
        case ACCESS_LEVEL.NO_USER:
            routes.push(...ROUTE_GROUPS.NO_USER);
    }

    return routes;
}

const ROUTE_ACCESS = {
    ALLOWED: 'ALLOWED',
    REQUIRES_AUTH: 'REQUIRES_AUTH',
    REQUIRES_WHITELIST: 'REQUIRES_WHITELIST',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
} as const;
type RouteAccessResult = typeof ROUTE_ACCESS[keyof typeof ROUTE_ACCESS];

const checkRouteAccess = (path: string, user: User | null): RouteAccessResult => {
    const customClaims = getCustomClaims(user);
    const accessLevel = getUserAccessLevel(customClaims);

    // Check if path is accessible at current access level
    const accessibleRoutes = getAccessibleRoutes(user);
    const hasAccess = accessibleRoutes.some(route =>
        path === route || path.startsWith(`${route}/`)
    );

    if (hasAccess) {
        return ROUTE_ACCESS.ALLOWED;
    }

    // Determine why access was denied
    if (accessLevel === ACCESS_LEVEL.NO_USER) {
        return ROUTE_ACCESS.REQUIRES_AUTH;
    }

    if (accessLevel === ACCESS_LEVEL.NOT_WHITELISTED) {
        return ROUTE_ACCESS.REQUIRES_WHITELIST;
    }

    return ROUTE_ACCESS.INSUFFICIENT_PERMISSIONS;
}

const authGuard: Handle = async ({ event, resolve }) => {
    const currentPath = event.url.pathname;

    // suppress some fuckass chrome devtool
    if (currentPath.startsWith('/.well-known/appspecific/com.chrome.devtools')) {
        return new Response(null, { status: 204 })
    }

    // always allow /api access regardless of anything
    if (currentPath.startsWith('/api')) {
        return resolve(event);
    }

    // Check route access
    const routeAccess = checkRouteAccess(currentPath, event.locals.user);

    if (routeAccess !== ROUTE_ACCESS.ALLOWED) {
        switch (routeAccess) {
            case ROUTE_ACCESS.REQUIRES_AUTH:
                return redirect(303, '/auth');
            case ROUTE_ACCESS.REQUIRES_WHITELIST: {
                const urlParams = new URLSearchParams({ error : ROUTE_ACCESS.REQUIRES_WHITELIST })
                return redirect(303, `/error?${urlParams.toString()}`);
            }
            case ROUTE_ACCESS.INSUFFICIENT_PERMISSIONS: {
                const urlParams = new URLSearchParams({ error : ROUTE_ACCESS.INSUFFICIENT_PERMISSIONS })
                return redirect(303, `/error?${urlParams.toString()}`);
            }
            default:
                return redirect(303, '/');
        }
    }

    return resolve(event);
}

export default authGuard;