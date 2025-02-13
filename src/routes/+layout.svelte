<script lang="ts">
    import { invalidate, invalidateAll } from '$app/navigation';
    import { SupaStore, UserStore } from '$lib/stores/SupabaseStore.js';
    import '$lib/styles/globals.css';
    import { onMount } from 'svelte';

    let { data, children } = $props();
    let { supabase, session, user } = $derived(data);

    $effect(() => {
        SupaStore.set(supabase);
        UserStore.set(user);
    })

    onMount(() => {
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (newSession?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth')
            }

            if (event === 'SIGNED_OUT') {
                invalidateAll();
            }
        });
    });

</script>

{@render children()}