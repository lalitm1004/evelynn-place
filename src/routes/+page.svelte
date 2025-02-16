<script lang="ts">
    const routes = [
        { id: 0, href: '/dashboard', display: 'Dashboard' },
        { id: 1, href: '/unisync', display: 'UniSync' },
        { id: 2, href: '/controlpanel', display: 'Control Panel' },
    ]
</script>

<svelte:head>
    <title>evelynn.place</title>
    <meta name="description" content="All your academic scheduling in one place">
</svelte:head>

<main class={`min-h-dvh w-dvw flex md:flex-row flex-col justify-center items-center gap-4`}>
    <img class={`mobile:hidden h-[200px] aspect-square rounded-md`} src={`/assets/images/e.webp`} alt={`evelynn mascot`}/>
    <div class={`flex flex-col gap-2 md:items-start items-center`}>
        <hgroup class={`flex flex-col md:items-start items-center`}>
            <h1 class={`font-kola md:text-8xl text-5xl`}>evelynn.place</h1>
            <p class={`md:text-3xl text-lg`}>All your academic scheduling in one place</p>
        </hgroup>
        <div class={`flex md:justify-start gap-2`}>
            {#each routes as route (route.id)}
                <a class={`apply-card add-button md:px-4 px-2 py-2 rounded-lg`} href={route.href}>{route.display}</a>
            {/each}
        </div>
    </div>
</main>