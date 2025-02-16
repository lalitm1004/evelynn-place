import { browser } from "$app/environment";
import { getCookie } from "$lib/utils/cookie";
import { writable } from "svelte/store";

const maxAgeAccess = 60 * 60; // 1 hour
const initalAccessToken = browser ? getCookie(document.cookie, 'evelynn-place-google-access-token') : null;
export const accessToken = writable<string | null>(initalAccessToken);
export const setAccessToken = (token: string | null) => {
    if (!browser) return;

    if (token) {
        document.cookie = `evelynn-place-google-access-token=${token};path=/;max-age=${maxAgeAccess};Secure;SameSite=Lax`;
    } else {
        document.cookie = `evelynn-place-google-access-token=null;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }

    accessToken.set(token);
}

const maxAgeRefresh = 300 * 24 * 60 * 60; // 200 days
const intialRefreshToken = browser ? getCookie(document.cookie, 'evelynn-place-google-refresh-token') : null;
export const refreshToken = writable<string | null>(intialRefreshToken);
export const setRefreshToken = (token: string | null) => {
    if (!browser) return;

    if (token) {
        document.cookie = `evelynn-place-google-refresh-token=${token};path=/;max-age=${maxAgeRefresh};Secure;SameSite=Lax`;
    } else {
        document.cookie = `evelynn-place-google-refresh-token=null;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }

    refreshToken.set(token);
}