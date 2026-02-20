<script lang="ts">
    import { Play, Pause, RotateCcw } from "@lucide/svelte";

    function formatDisplay(totalSeconds: number): {
        h: string;
        m: string;
        s: string;
    } {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return {
            h: h.toString().padStart(2, "0"),
            m: m.toString().padStart(2, "0"),
            s: s.toString().padStart(2, "0"),
        };
    }

    let totalSeconds = $state(300); // 5 min default
    let remaining = $state(300);
    let running = $state(false);
    let editing = $state(true);
    let interval: ReturnType<typeof setInterval> | null = null;
    let endTime = 0;

    let inputH = $state("00");
    let inputM = $state("05");
    let inputS = $state("00");

    let display = $derived(formatDisplay(remaining));
    let progress = $derived(
        totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0,
    );

    function clearTimer() {
        if (interval) clearInterval(interval);
        interval = null;
    }

    function start() {
        if (editing) {
            const h = parseInt(inputH) || 0;
            const m = parseInt(inputM) || 0;
            const s = parseInt(inputS) || 0;
            const total = h * 3600 + m * 60 + s;
            if (total <= 0) return;
            totalSeconds = total;
            remaining = total;
            editing = false;
            endTime = Date.now() + total * 1000;
        } else {
            endTime = Date.now() + remaining * 1000;
        }
        interval = setInterval(() => {
            const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
            remaining = left;
            if (left <= 0) {
                clearTimer();
                running = false;
            }
        }, 100);
        running = true;
    }

    function pause() {
        clearTimer();
        running = false;
    }

    function reset() {
        clearTimer();
        running = false;
        editing = true;
        remaining = totalSeconds;
    }

    // Cleanup on destroy
    $effect(() => {
        return () => clearTimer();
    });

    // Sound alert when done
    $effect(() => {
        if (remaining === 0 && !editing) {
            try {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 800;
                gain.gain.value = 0.3;
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            } catch {}
        }
    });
</script>

<div class="mx-auto flex max-w-lg flex-col items-center gap-8 py-12">
    {#if editing}
        <div class="flex items-center gap-2 text-6xl font-light sm:text-7xl">
            <input
                type="text"
                bind:value={inputH}
                oninput={() => (inputH = inputH.replace(/\D/g, "").slice(0, 2))}
                class="w-20 bg-transparent text-center font-mono text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-lg sm:w-24"
                placeholder="HH"
            />
            <span class="text-muted-foreground">:</span>
            <input
                type="text"
                bind:value={inputM}
                oninput={() => (inputM = inputM.replace(/\D/g, "").slice(0, 2))}
                class="w-20 bg-transparent text-center font-mono text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-lg sm:w-24"
                placeholder="MM"
            />
            <span class="text-muted-foreground">:</span>
            <input
                type="text"
                bind:value={inputS}
                oninput={() => (inputS = inputS.replace(/\D/g, "").slice(0, 2))}
                class="w-20 bg-transparent text-center font-mono text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-lg sm:w-24"
                placeholder="SS"
            />
        </div>
    {:else}
        <div class="relative flex flex-col items-center gap-4">
            <div
                class="font-mono text-6xl font-light tracking-wider text-foreground tabular-nums sm:text-7xl"
            >
                {display.h}:{display.m}:{display.s}
            </div>
            <div class="h-1 w-64 overflow-hidden rounded-full bg-secondary">
                <div
                    class="h-full rounded-full bg-primary transition-all duration-300"
                    style="width: {progress}%"
                ></div>
            </div>
            {#if remaining === 0}
                <div
                    class="mt-2 text-lg font-medium text-primary"
                >
                    Time's up!
                </div>
            {/if}
        </div>
    {/if}

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
                onclick={pause}
                class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
            >
                <Pause size={22} />
            </button>
        {/if}
        {#if !editing}
            <button
                onclick={reset}
                class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-transform hover:scale-105 active:scale-95"
            >
                <RotateCcw size={18} />
            </button>
        {/if}
    </div>

    {#if editing}
        <div class="flex flex-wrap justify-center gap-2">
            {#each [1, 2, 5, 10, 15, 30, 60] as min}
                <button
                    onclick={() => {
                        const h = Math.floor(min / 60);
                        const m = min % 60;
                        inputH = h.toString().padStart(2, "0");
                        inputM = m.toString().padStart(2, "0");
                        inputS = "00";
                    }}
                    class="rounded-lg bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                    {min >= 60 ? `${min / 60}h` : `${min}m`}
                </button>
            {/each}
        </div>
    {/if}
</div>
