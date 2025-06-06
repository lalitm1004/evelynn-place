import { redirect, type Handle } from '@sveltejs/kit';

const authGuard: Handle = async ({ event, resolve }) => {
    const currentPath = event.url.pathname;

    if (currentPath.startsWith('/.well-known/appspecific/com.chrome.devtools')) {
        return new Response(null, { status: 204 })
    }

    if (currentPath.startsWith('/api')) {
        return resolve(event);
    }

    const user = event.locals.user;
    if (!user && currentPath !== '/') {
        return redirect(303, '/');
    }

    return resolve(event);
}

export default authGuard;