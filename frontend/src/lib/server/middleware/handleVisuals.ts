import { DEVICE_TOKEN } from "$lib/stores/VisualStore";
import type { Handle } from "@sveltejs/kit";

const handleVisuals: Handle = async ({ event, resolve }) => {
    const response = await resolve(event, {
        transformPageChunk: ({ html }) => {
            const maxAgeSec = 60 * 60 * 24 * 365;

            let currentDevice = event.cookies.get(DEVICE_TOKEN);
            if (!currentDevice) {
                const userOnMobile = event.request.headers.get('sec-ch-ua-mobile') === '?1';
                currentDevice = userOnMobile ? 'mobile' : 'desktop';

                event.cookies.set(DEVICE_TOKEN, currentDevice, {
                    path: '/',
                    expires: new Date(Date.now() + maxAgeSec),
                    maxAge: maxAgeSec,
                    httpOnly: false,
                    sameSite: 'strict',
                })
            }

            return html
                .replace('data-device=""', `data-device="${currentDevice}"`)
        }
    });

    response.headers.set('Accept-CH', 'Sec-CH-UA-Mobile');
    response.headers.set('Vary', 'Sec-CH-UA-Mobile');
    response.headers.set('Critical-CH', 'Sec-CH-UA-Mobile');

    return response;
}

export default handleVisuals;