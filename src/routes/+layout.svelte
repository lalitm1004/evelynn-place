<script lang="ts">
    import { invalidate, invalidateAll } from '$app/navigation';
    import { SupaStore, UserStore } from '$lib/stores/SupabaseStore.js';
    import { accessToken, refreshToken, setAccessToken, setRefreshToken } from '$lib/stores/TokenStore.js';
    import { onMount } from 'svelte';
    import '$lib/styles/globals.css';

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
                console.log('access - ', newSession.provider_token)
                setAccessToken(newSession.provider_token);
            }

            if (newSession && newSession.provider_refresh_token) {
                console.log('refresh - ', newSession.provider_refresh_token)
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

        return () => subscription.unsubscribe();
    });
</script>

{@render children()}