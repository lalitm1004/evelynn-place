<script lang="ts">
    let { data } = $props();
    let { profile } = $derived(data);
</script>

<main class={`min-h-dvh w-dvw flex`}>
    <div class={`apply-card flex flex-col`}>
        {profile?.name}
    </div>
</main>

<svelte:head>
    <title>Profile</title>
    <meta name="description" content="Profile">
</svelte:head>