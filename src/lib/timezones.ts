export interface TimezoneInfo {
    name: string;
    label: string;
    offset: string;
}

// All IANA timezones
export const ALL_TIMEZONES: TimezoneInfo[] = Intl.supportedValuesOf("timeZone").map((tz: string) => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    const offset = offsetPart?.value || "";

    const label = tz.replace(/_/g, " ").replace(/\//g, " / ");
    return { name: tz, label, offset };
});

export function getCurrentTimeInTimezone(tz: string, use24h: boolean, baseDate?: Date): string {
    const d = baseDate || new Date();
    return d.toLocaleTimeString("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: !use24h,
    });
}

export function getTimeInTimezoneForDate(tz: string, use24h: boolean, date: Date): string {
    return date.toLocaleTimeString("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: !use24h,
    });
}

export function getDateInTimezone(tz: string, baseDate?: Date): string {
    const d = baseDate || new Date();
    return d.toLocaleDateString("en-US", {
        timeZone: tz,
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

export function getHourInTimezone(tz: string, baseDate?: Date): number {
    const d = baseDate || new Date();
    const hour = parseInt(d.toLocaleString("en-US", { timeZone: tz, hour: "numeric", hour12: false }), 10);
    return hour;
}

export function getMinuteInTimezone(tz: string, baseDate?: Date): number {
    const d = baseDate || new Date();
    return parseInt(d.toLocaleString("en-US", { timeZone: tz, minute: "numeric" }), 10);
}

export function getOffsetHours(tz: string): number {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}

export const DEFAULT_TIMEZONES = ["America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Tokyo"];
