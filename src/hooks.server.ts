import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import { getUserProfile } from "$lib/server/database/user.db";
import { RedirectError } from "$lib/types/redirectError.type";
import type { IRoute } from "$lib/types/route.type";
import { getPermittedRoutes } from "$lib/utils/getPermittedRoutes";
import { createServerClient } from "@supabase/ssr";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const createSupabase: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return event.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                    event.cookies.set(name, value, { ...options, path: '/' })
                );
            },
        },
    })

    event.locals.safeGetSession = async () => {
        const {
            data: { user },
            error
        } = await event.locals.supabase.auth.getUser();
        if (error) {
            return { session: null, user: null }
        }

        const {
            data: { session }
        } = await event.locals.supabase.auth.getSession();
        if (!session) {
            return { session: null, user: null }
        }

        return { session, user }
    }

    event.locals.getSession = async () => {
        const { session } = await event.locals.safeGetSession();
        return session;
    }
    event.locals.session = await event.locals.getSession();

    event.locals.getUser = async () => {
        const { user } = await event.locals.safeGetSession();
        return user;
    }
    event.locals.user = await event.locals.getUser();

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version'
        },
    });
}

const authGuard: Handle = async ({ event, resolve }) => {
    const user = event.locals.user;

    let permittedRoutes: IRoute[];
    if (!user) {
        permittedRoutes = getPermittedRoutes(null)
    } else {
        try {
            const profile = await getUserProfile(user.id);
            permittedRoutes = getPermittedRoutes(profile);
        } catch (error) {
            redirect(303, `/error?type=${error}`)
        }
    }

    const currentPath = event.url.pathname;
    const hasAccess = permittedRoutes.some(path =>
        currentPath === path.href || currentPath.startsWith(`${path.href}/`)
    )

    if (!hasAccess) redirect(303, `/error?type=${RedirectError.INVALID_PERMS}`)

    return resolve(event);
}

const handleVisuals: Handle = async ({ event, resolve }) => {
    const response = await resolve(event, {
        transformPageChunk: ({ html }) => {
            const maxAge = 60 * 60 * 24 * 365;

            // handle theme
            let currentTheme = event.cookies.get('evelynn-place-theme');
            if (!currentTheme) {
                const userPrefersDark = event.request.headers.get('sec-ch-prefers-color-scheme') === 'dark';
                currentTheme = userPrefersDark ? 'dark' : 'light';

                event.cookies.set('evelynn-place-theme', currentTheme, {
                    path: '/',
                    expires: new Date(Date.now() + maxAge),
                    maxAge,
                    httpOnly: false,
                    sameSite: 'strict',
                });
            }

            // handle device
            let currentDevice = event.cookies.get('evelynn-place-device');
            if (!currentDevice) {
                const userOnMobile = event.request.headers.get('sec-ch-ua-mobile') === '?1';
                currentDevice = userOnMobile ? 'mobile' : 'desktop';

                event.cookies.set('evelynn-place-device', currentDevice, {
                    path: '/',
                    expires: new Date(Date.now() + maxAge),
                    maxAge,
                    httpOnly: false,
                    sameSite: 'strict',
                })
            }

            return html
                .replace('data-theme=""', `data-theme="${currentTheme}"`)
                .replace('data-device=""', `data-device="${currentDevice}"`)
        },
    });

    response.headers.set('Accept-CH', 'Sec-CH-Prefers-Color-Scheme, Sec-CH-UA-Mobile');
    response.headers.set('Vary', 'Sec-CH-Prefers-Color-Scheme, Sec-CH-UA-Mobile');
    response.headers.set('Critical-CH', 'Sec-CH-Prefers-Color-Scheme, Sec-CH-UA-Mobile');

    return response;
}

export const handle: Handle = sequence(createSupabase, authGuard, handleVisuals);