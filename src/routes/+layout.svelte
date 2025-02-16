<script lang="ts">
    import '$lib/styles/globals.css';
    import { onMount } from 'svelte';
    import { invalidate, invalidateAll } from '$app/navigation';
    import { getCookie } from '$lib/utils/cookie.js';
    import { SupaStore, UserStore } from '$lib/stores/SupabaseStore.js';
    import { accessToken, refreshToken, setAccessToken, setRefreshToken } from '$lib/stores/TokenStore.js';
    import { setDevice, setTheme, theme } from '$lib/stores/VisualStore.js';

    let { data, children } = $props();
    let { supabase, session, user } = $derived(data);

    $effect(() => {
        // setting stores
        SupaStore.set(supabase);
        UserStore.set(user);
    })

    const validateTokens = async () => {
        if (!user) return;

        if (!$refreshToken) {
            await supabase.auth.signOut();
        }

        if ($accessToken) return;

        const response = await fetch('/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: $refreshToken }),
        });

        if (!response.ok) {
            await supabase.auth.signOut();
            return;
        }

        const data = await response.json();

        if (!data.accessToken) {
            await supabase.auth.signOut();
            return;
        }
        setAccessToken(data.accessToken);

        if (data.refreshToken && $refreshToken !== data.refreshToken) {
            setRefreshToken(data.refreshToken);
        }
    }

    onMount(() => {
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (newSession?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth')
            }

            if (newSession && newSession.provider_token) {
                setAccessToken(newSession.provider_token);
            }

            if (newSession && newSession.provider_refresh_token) {
                setRefreshToken(newSession.provider_refresh_token);
            }

            if (event === 'SIGNED_OUT') {
                invalidateAll();
                setAccessToken(null);
                setRefreshToken(null);
                return;
            }

            validateTokens();
        });

        // handle theme
        const themeCookie = getCookie(document.cookie, 'evelynn-place-theme') as Theme | null;
        if (themeCookie) theme.set(themeCookie);
        else if (window.matchMedia('(prefers-color-scheme: light)').matches) setTheme('light');
        else setTheme('dark');

        // handle device
        if (window.matchMedia('(max-width: 767px)').matches) setDevice('mobile');
        else setDevice('desktop');

        return () => subscription.unsubscribe();
    });
</script>

<!-- handle device on resize -->
<svelte:window onresize={() => setDevice(window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop')}/>

{@render children()}