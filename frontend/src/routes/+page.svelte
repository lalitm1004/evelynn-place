<script lang="ts">
    import { PUBLIC_BACKEND_URL } from "$env/static/public";
    import { fetchWithAuthBrowser } from "$lib/utils/fetchWithAuth";

    const handleClick = async () => {
        fetchWithAuthBrowser("/test", {
            method: 'GET'
        });
    }

    const handleClick2 = async () => {
        fetch(`${PUBLIC_BACKEND_URL}/test`, {
            method: 'GET'
        });
    }
</script>

<div class={`grid place-items-center h-dvh w-dvw`}>
    <button onclick={() => handleClick()} class={`border-2 rounded-md px-4 py-3`}>
        Send Request
    </button>
    <button onclick={() => handleClick2()} class={`border-2 rounded-md px-4 py-3`}>
        Send Request Without Header
    </button>
</div>