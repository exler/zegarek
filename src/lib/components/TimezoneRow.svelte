<script lang="ts">
    import { X, GripVertical } from "@lucide/svelte";
    import {
        getDateInTimezone,
        getHourInTimezone,
        getMinuteInTimezone,
        getCurrentTimeInTimezone,
    } from "$lib/timezones";
    import { cn } from "$lib/utils";

    interface Props {
        timezone: string;
        use24h: boolean;
        onRemove: (tz: string) => void;
        isLocal?: boolean;
        baseDate?: Date;
        onSelectHour: (hour: number) => void;
        onSelectMinute: (minute: number) => void;
        ondragstart?: (e: DragEvent) => void;
        ondragover?: (e: DragEvent) => void;
        ondrop?: (e: DragEvent) => void;
    }

    let {
        timezone,
        use24h,
        onRemove,
        isLocal,
        baseDate,
        onSelectHour,
        onSelectMinute,
        ondragstart,
        ondragover,
        ondrop,
    }: Props = $props();

    const HOURS = Array.from({ length: 24 }, (_, i) => i);
    const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    function getHourLabel(hour: number, use24h: boolean): string {
        if (use24h) return hour.toString().padStart(2, "0");
        if (hour === 0) return "12a";
        if (hour === 12) return "12p";
        if (hour < 12) return `${hour}a`;
        return `${hour - 12}p`;
    }

    function isDaytime(hour: number): boolean {
        return hour >= 6 && hour < 20;
    }

    let isDragging = $state(false);

    let currentTime = $derived(
        getCurrentTimeInTimezone(timezone, use24h, baseDate),
    );
    let date = $derived(getDateInTimezone(timezone, baseDate));
    let currentHour = $derived(getHourInTimezone(timezone, baseDate));
    let currentMinute = $derived(getMinuteInTimezone(timezone, baseDate));
    let cityName = $derived(
        timezone.split("/").pop()?.replace(/_/g, " ") || timezone,
    );
    let nearestFive = $derived((Math.round(currentMinute / 5) * 5) % 60);

    function handleDragStart(e: DragEvent) {
        isDragging = true;
        e.dataTransfer?.setData("text/plain", timezone);
        ondragstart?.(e);
    }

    function handleDragEnd() {
        isDragging = false;
    }
</script>

<div
    draggable={!isLocal}
    ondragstart={handleDragStart}
    ondragend={handleDragEnd}
    {ondragover}
    {ondrop}
    role="listitem"
    class={cn("group flex flex-col sm:flex-row items-stretch gap-3 rounded-lg bg-card p-3 transition-colors hover:bg-secondary/50", {
        "opacity-50 z-50": isDragging,
    })}
>
    <div class="flex flex-row gap-4">
        <button
                class={cn("flex shrink-0 cursor-grab items-center text-muted-foreground/40 transition-colors hover:text-muted-foreground active:cursor-grabbing", {
                    "invisible pointer-events-none": isLocal,
                })}
                aria-label="Drag to reorder"
            >
                <GripVertical size={14} />
            </button>

        <div class="flex w-48 shrink-0 flex-col justify-center">
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-foreground">{cityName}</span>
                {#if isLocal}
                    <span
                        class="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary"
                    >
                        LOCAL
                    </span>
                {/if}
            </div>
            <span class="text-xs text-muted-foreground">{date}</span>
            <span
                class="mt-0.5 font-mono text-lg font-semibold text-foreground tabular-nums"
            >
                {currentTime}
            </span>
        </div>
    </div>

    <div class="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <!-- Hour grid -->
        <div class="flex items-center gap-px mx-px mt-px">
            {#each HOURS as hour, idx}
                {@const isCurrent = hour === currentHour}
                {@const daytime = isDaytime(hour)}
                <button
                    onclick={() => onSelectHour(hour)}
                    class={cn("relative flex flex-1 items-center justify-center py-2 text-[9px] transition-all cursor-pointer hover:ring-1 hover:ring-primary/40", {
                        // "rounded-tl-md": idx === 0,
                        // "rounded-tr-md": idx === HOURS.length - 1,
                        "bg-primary/30 text-primary ring-1 ring-primary/50": isCurrent,
                        "bg-muted/60 text-muted-foreground hover:bg-muted": !isCurrent && daytime,
                        "bg-card text-muted-foreground/50 hover:bg-muted/30": !isCurrent && !daytime,
                    })}
                >
                    <span class="font-mono leading-none"
                        >{getHourLabel(hour, use24h)}</span
                    >
                </button>
            {/each}
        </div>

        <!-- Minute grid -->
        <div class="flex items-center gap-px mx-px">
            {#each MINUTES as minute, idx}
                {@const isCurrent = minute === nearestFive}
                <button
                    onclick={() => onSelectMinute(minute)}
                    class={cn("relative flex flex-1 items-center justify-center py-1 text-[8px] transition-all cursor-pointer hover:ring-1 hover:ring-primary/40", {
                            "bg-primary/30 text-primary ring-1 ring-primary/50": isCurrent,
                            "bg-muted/30 text-muted-foreground/60 hover:bg-muted/50": !isCurrent,
                        })}
                >
                    <span class="font-mono leading-none"
                        >{minute.toString().padStart(2, "0")}</span
                    >
                </button>
            {/each}
        </div>
    </div>

    <button
        onclick={() => onRemove(timezone)}
        class={cn("flex shrink-0 items-center justify-center rounded-md px-1 text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover:opacity-100", {
            "invisible pointer-events-none": isLocal,
        })}
    >
        <X size={14} />
    </button>
</div>
