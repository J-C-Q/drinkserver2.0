// Calendar arithmetic in Europe/Berlin, independent of the server's time zone
// (UTC on Vercel).

// Calendar day in Berlin as YYYY-MM-DD.
export function berlinDay(date: Date) {
    return date.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

// Monday of the Berlin calendar week as YYYY-MM-DD, so weeks of different
// years never compare equal.
export function berlinWeek(date: Date) {
    const day = new Date(berlinDay(date) + "T00:00:00Z");
    day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
    return day.toISOString().slice(0, 10);
}

// Offset of Berlin wall-clock time from UTC at the given instant, in ms.
function berlinOffset(instant: number) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Berlin",
        hourCycle: "h23",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(new Date(instant));
    const get = (type: string) => Number(parts.find((part) => part.type === type)!.value);
    const wallClock = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
    return wallClock - Math.floor(instant / 1000) * 1000;
}

// The instant Berlin's current calendar day began. Daylight saving changes
// happen at 02:00/03:00, so the offset at 00:00 UTC of the same date is the
// offset in effect at Berlin midnight.
export function startOfBerlinDay(date: Date) {
    const midnightUtc = Date.parse(berlinDay(date) + "T00:00:00Z");
    return new Date(midnightUtc - berlinOffset(midnightUtc));
}
