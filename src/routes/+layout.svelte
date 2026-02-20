<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Zegarek</title>
	<meta
		name="description"
		content="Zegarek is a timezone comparison app with additional stopwatch and timer capabilities."
	/>
</svelte:head>
{@render children()}
