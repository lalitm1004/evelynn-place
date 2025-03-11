import { RedirectError } from "$lib/types/redirectError.type";
import type { IRoute } from "$lib/types/route.type";
import { UserRole, type UserProfile } from "@prisma/client";

const anonRoutes: IRoute[] = [
    { id: 0, href: '/', display: 'Home' },
    { id: 1, href: '/api', display: 'Api' },
    { id: 2, href: '/error', display: 'Error' },
]

const baseBlacklistRoutes: IRoute[] = [
    { id: 10, href: '/profile', display: 'Profile' },
    { id: 11, href: '/controlpanel', display: 'Control Panel' },
]

const baseWhitelistRoutes: IRoute[] = [
    { id: 20, href: '/dashboard', display: 'Dashboard' },
    { id: 21, href: '/unisync', display: 'Unisync' },
    { id: 23, href: '/enrollments', display: 'Enrollments' },
]

const helperRoutes: IRoute[] = [
    { id: 30, href: '/helper', display: 'Helper Panel' },
]

const adminRoutes: IRoute[] = [
    { id: 40, href: '/admin', display: 'Admin Panel' },
]


export const getPermittedRoutes = (user: UserProfile | null): IRoute[] => {
    if (!user) return anonRoutes;

    let permittedRoutes = [...anonRoutes]
    const role = user.role
    switch (role) {
        case UserRole.ADMIN:
            permittedRoutes.push(...adminRoutes);
        case UserRole.HELPER:
            permittedRoutes.push(...helperRoutes);
        case UserRole.BASE:
            permittedRoutes.push(...baseBlacklistRoutes);
            if (user.isWhitelisted) {
                permittedRoutes.push(...baseWhitelistRoutes);
            }
            break;
        default:
            throw new Error(RedirectError.INVALID_ROLE);
    }

    return permittedRoutes;
}