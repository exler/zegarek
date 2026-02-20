<script lang="ts">
    import { Play, Pause, RotateCcw, Flag } from "@lucide/svelte";

    function formatTime(ms: number): string {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);

        if (hours > 0) {
            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
        }
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
    }

    let elapsed = $state(0);
    let running = $state(false);
    let laps = $state<number[]>([]);
    let interval: ReturnType<typeof setInterval> | null = null;
    let startTime = 0;

    function start() {
        startTime = Date.now() - elapsed;
        interval = setInterval(() => {
            elapsed = Date.now() - startTime;
        }, 10);
        running = true;
    }

    function stop() {
        if (interval) clearInterval(interval);
        interval = null;
        running = false;
    }

    function reset() {
        if (interval) clearInterval(interval);
        interval = null;
        running = false;
        elapsed = 0;
        laps = [];
    }

    function lap() {
        laps = [elapsed, ...laps];
    }
</script>

<div class="mx-auto flex max-w-lg flex-col items-center gap-8 py-12">
    <div
        class="font-mono text-6xl font-light tracking-wider text-foreground tabular-nums sm:text-7xl"
    >
        {formatTime(elapsed)}
    </div>

    <div class="flex items-center gap-3">
        {#if !running}
            <button
                onclick={start}
                class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
            >
                <Play size={22} class="ml-0.5" />
            </button>
        {:else}
            <button
                onclick={stop}
                class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
            >
                <Pause size={22} />
            </button>
        {/if}
        {#if running}
            <button
                onclick={lap}
                class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-transform hover:scale-105 active:scale-95"
            >
                <Flag size={18} />
            </button>
        {/if}
        {#if elapsed > 0 && !running}
            <button
                onclick={reset}
                class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-transform hover:scale-105 active:scale-95"
            >
                <RotateCcw size={18} />
            </button>
        {/if}
    </div>

    {#if laps.length > 0}
        <div class="w-full space-y-1">
            <div
                class="flex items-center justify-between px-3 text-xs text-muted-foreground"
            >
                <span>Lap</span>
                <span>Time</span>
            </div>
            <div class="max-h-64 overflow-y-auto scrollbar-thin">
                {#each laps as lapTime, i}
                    {@const lapNum = laps.length - i}
                    {@const prevLapTime = laps[i + 1] || 0}
                    {@const diff = lapTime - prevLapTime}
                    <div
                        class="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary/50"
                    >
                        <span class="text-muted-foreground">#{lapNum}</span>
                        <div class="flex gap-4">
                            <span
                                class="font-mono text-muted-foreground tabular-nums"
                                >+{formatTime(diff)}</span
                            >
                            <span class="font-mono text-foreground tabular-nums"
                                >{formatTime(lapTime)}</span
                            >
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>
