import { browser } from "$app/environment";
import { writable } from "svelte/store";

const MAX_AGE = 365 * 24 * 60 * 60; // 1 year

const initialTheme = browser ? window.localStorage.getItem('evelynn-place-theme') ?? 'dark' : 'dark';
export const theme = writable<Theme>(initialTheme as Theme);
export const setTheme = (value: Theme) => {
    if (!browser) return;

    window.localStorage.setItem('evelynn-place-theme', value);
    document.documentElement.dataset.theme = value;
    document.cookie = `evelynn-place-theme=${value};path=/;max-age=${MAX_AGE}`;
    theme.set(value);
}

const initialDevice = browser ? window.localStorage.getItem('evelynn-place-device') ?? 'mobile' : 'mobile';
export const device = writable<Device>(initialDevice as Device);
export const setDevice = (value: Device) => {
    if (!browser) return;

    window.localStorage.setItem('evelynn-place-device', value);
    document.documentElement.dataset.device  = value;
    document.cookie = `evelynn-place-device=${value};path=/;max-age=${MAX_AGE}`;
    device.set(value);
}