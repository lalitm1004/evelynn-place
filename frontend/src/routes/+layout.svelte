<script lang="ts">
	import { invalidateAll } from '$app/navigation';
    import { setJwtToken } from '$lib/stores/JwtTokenStore.js';
    import { SupaStore, UserStore } from '$lib/stores/SupaStore.js';
    import { setDevice } from '$lib/stores/VisualStore.js';
    import { onMount } from 'svelte';
	import '$lib/styles/app.css';

	let { children, data } = $props();
	let { supabase, session, user } = $derived(data);

	const handleDevice = () => {
		setDevice(
			window.matchMedia('(max-width: 767px)').matches
				? 'mobile'
				: 'desktop'
		)
	}

	onMount(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, newSession) => {
			if (
				newSession?.expires_at !== session?.expires_at ||
				event === 'SIGNED_OUT'
			) {
				setJwtToken(null);
				invalidateAll();
			}

			if (
				["SIGNED_IN", "TOKEN_REFRESHED"].includes(event) &&
				session?.access_token
			) {
				setJwtToken(session.access_token);
			}
		});

		SupaStore.set(supabase);
		UserStore.set(user);

		handleDevice();

		return () => subscription.unsubscribe();
	})
</script>

<svelte:window onresize={handleDevice}/>

{@render children()}
