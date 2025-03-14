import type { IToast } from "$lib/types/toast.type";
import nanoid from "$lib/utils/nanoid";
import { writable } from "svelte/store";

export const ToastStore = writable<IToast[]>([]);

export const addToast = (toast: IToast) => {
    const id = nanoid();

    ToastStore.update(all => {
        if (all.length > 0) {
            dismissToast(all[0].id!);
            return [...all];
        }
        return [{ ...toast, id: id }, ...all];
    });
    if (toast.timeout) setTimeout(() => dismissToast(id), toast.timeout);
    else setTimeout(() => dismissToast(id), 5000);
}

export const dismissToast = (id: string) => {
    ToastStore.update((all) => all.filter((t) => t.id !== id));
};