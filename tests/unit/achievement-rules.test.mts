import assert from "node:assert/strict";
import { test } from "node:test";

import { checkAchievement, type AchievementData, type AchievementOrder } from "../../src/lib/achievement-rules.ts";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

// An order at the given instant; defaults to a 1.50 € drink with no sugar or caffeine data.
const order = (date: string | Date, fields: Partial<AchievementOrder> = {}): AchievementOrder => ({
    date: new Date(date),
    itemid: "mate",
    itemname: "Mate",
    priceCents: 150,
    sugar: null,
    caffeine: null,
    ...fields,
});

const data = (orders: AchievementOrder[], extra: Partial<AchievementData> = {}): AchievementData => ({
    orders,
    items: [],
    payments: [],
    ...extra,
});

const earns = (name: string, d: AchievementData) => checkAchievement(name, d);

// n orders one minute apart starting at the given instant.
const repeated = (n: number, start: string, fields: Partial<AchievementOrder> = {}) =>
    Array.from({ length: n }, (_, i) => order(new Date(Date.parse(start) + i * MINUTE), fields));

test("unknown achievements are never earned", () => {
    assert.equal(earns("No Such Achievement", data(repeated(600, "2026-09-24T10:00:00Z"))), false);
});

test("existing rules still work after the move", () => {
    assert.equal(earns("First Drink", data([])), false);
    assert.equal(earns("First Drink", data([order("2026-09-24T10:00:00Z")])), true);
    // 23:30 Berlin (CEST) is 21:30 UTC.
    assert.equal(earns("Night Owl", data([order("2026-09-24T21:30:00Z")])), true);
    assert.equal(earns("Night Owl", data([order("2026-09-24T12:00:00Z")])), false);
    assert.equal(earns("Thirsty", data(repeated(3, "2026-09-24T10:00:00Z"))), true);
    assert.equal(earns("Caffein Bomb", data(repeated(2, "2026-09-24T10:00:00Z", { caffeine: 100 }))), true);
});

test("Stammgast and Legend: 250 and 500 drinks", () => {
    assert.equal(earns("Stammgast", data(repeated(249, "2026-01-01T10:00:00Z"))), false);
    assert.equal(earns("Stammgast", data(repeated(250, "2026-01-01T10:00:00Z"))), true);
    assert.equal(earns("Legend", data(repeated(499, "2026-01-01T10:00:00Z"))), false);
    assert.equal(earns("Legend", data(repeated(500, "2026-01-01T10:00:00Z"))), true);
});

test("Anniversary: still ordering a year after the first drink", () => {
    const first = order("2025-09-24T10:00:00Z");
    assert.equal(earns("Anniversary", data([first, order("2026-09-22T10:00:00Z")])), false);
    assert.equal(earns("Anniversary", data([first, order("2026-09-24T10:00:00Z")])), true);
});

test("Comeback: an order after a break of 30 days", () => {
    assert.equal(earns("Comeback", data([order("2026-01-01T10:00:00Z"), order(new Date(Date.parse("2026-01-01T10:00:00Z") + 29 * DAY))])), false);
    assert.equal(earns("Comeback", data([order("2026-01-01T10:00:00Z"), order(new Date(Date.parse("2026-01-01T10:00:00Z") + 30 * DAY))])), true);
});

test("Perfect Week: every working day of one week", () => {
    // Monday 21 to Friday 25 September 2026.
    const week = ["21", "22", "23", "24", "25"].map((d) => order(`2026-09-${d}T10:00:00Z`));
    assert.equal(earns("Perfect Week", data(week)), true);
    assert.equal(earns("Perfect Week", data(week.slice(0, 4))), false);
    // Tuesday to Friday, then Monday of the next week: two different weeks.
    assert.equal(earns("Perfect Week", data([...week.slice(1), order("2026-09-28T10:00:00Z")])), false);
});

test("Iron Liver: 20 working days in a row, weekends do not break the streak", () => {
    const workingDays = (n: number, start: string) => {
        const orders: AchievementOrder[] = [];
        for (let day = new Date(start); orders.length < n; day = new Date(day.getTime() + DAY)) {
            if (day.getUTCDay() !== 0 && day.getUTCDay() !== 6) {
                orders.push(order(day));
            }
        }
        return orders;
    };
    // Starting Monday 7 September 2026.
    assert.equal(earns("Iron Liver", data(workingDays(20, "2026-09-07T10:00:00Z"))), true);
    assert.equal(earns("Iron Liver", data(workingDays(19, "2026-09-07T10:00:00Z"))), false);
    // A missed working day in the middle restarts the count.
    const gap = workingDays(21, "2026-09-07T10:00:00Z");
    gap.splice(10, 1);
    assert.equal(earns("Iron Liver", data(gap)), false);
});

test("Full Calendar: ordered on every day of the week", () => {
    const days = ["21", "22", "23", "24", "25", "26", "27"].map((d) => order(`2026-09-${d}T10:00:00Z`));
    assert.equal(earns("Full Calendar", data(days)), true);
    assert.equal(earns("Full Calendar", data(days.slice(0, 6))), false);
});

test("Lunch Break: between 12:00 and 13:00 Berlin time", () => {
    // CEST: 12:30 Berlin is 10:30 UTC.
    assert.equal(earns("Lunch Break", data([order("2026-09-24T10:30:00Z")])), true);
    assert.equal(earns("Lunch Break", data([order("2026-09-24T12:30:00Z")])), false);
    // CET: 12:10 Berlin is 11:10 UTC.
    assert.equal(earns("Lunch Break", data([order("2026-01-15T11:10:00Z")])), true);
});

test("Feierabend: Friday from 17:00 Berlin time", () => {
    // Friday 25 September 2026, 17:05 Berlin.
    assert.equal(earns("Feierabend", data([order("2026-09-25T15:05:00Z")])), true);
    assert.equal(earns("Feierabend", data([order("2026-09-25T14:55:00Z")])), false);
    // Thursday evening.
    assert.equal(earns("Feierabend", data([order("2026-09-24T16:00:00Z")])), false);
});

test("Double Fisting: two orders within 60 seconds", () => {
    assert.equal(earns("Double Fisting", data([order("2026-09-24T10:00:00Z"), order("2026-09-24T10:00:59Z")])), true);
    assert.equal(earns("Double Fisting", data([order("2026-09-24T10:00:00Z"), order("2026-09-24T10:01:01Z")])), false);
});

test("Silent Night: Christmas or New Year's Day in Berlin", () => {
    assert.equal(earns("Silent Night", data([order("2025-12-24T10:00:00Z")])), true);
    assert.equal(earns("Silent Night", data([order("2025-12-26T10:00:00Z")])), true);
    // 00:30 on 1 January in Berlin is still 31 December in UTC.
    assert.equal(earns("Silent Night", data([order("2025-12-31T23:30:00Z")])), true);
    assert.equal(earns("Silent Night", data([order("2025-12-23T10:00:00Z")])), false);
});

test("Pi Day: 14 March", () => {
    assert.equal(earns("Pi Day", data([order("2026-03-14T10:00:00Z")])), true);
    assert.equal(earns("Pi Day", data([order("2026-03-15T10:00:00Z")])), false);
});

test("Friday the 13th", () => {
    // 13 November 2026 is a Friday, 13 October 2026 a Tuesday.
    assert.equal(earns("Friday the 13th", data([order("2026-11-13T10:00:00Z")])), true);
    assert.equal(earns("Friday the 13th", data([order("2026-10-13T10:00:00Z")])), false);
});

test("Sommelier: 10 different drinks", () => {
    const drinks = (n: number) => Array.from({ length: n }, (_, i) => order("2026-09-24T10:00:00Z", { itemid: `d${i}` }));
    assert.equal(earns("Sommelier", data(drinks(10))), true);
    assert.equal(earns("Sommelier", data(drinks(9))), false);
});

test("Rainbow: 4 different drinks on one day", () => {
    const four = ["a", "b", "c", "d"].map((id) => order("2026-09-24T10:00:00Z", { itemid: id }));
    assert.equal(earns("Rainbow", data(four)), true);
    assert.equal(earns("Rainbow", data([...four.slice(0, 3), order("2026-09-25T10:00:00Z", { itemid: "d" })])), false);
});

test("Creature of Habit: 15 orders in a row of the same drink", () => {
    assert.equal(earns("Creature of Habit", data(repeated(15, "2026-09-24T10:00:00Z"))), true);
    const broken = repeated(15, "2026-09-24T10:00:00Z");
    broken[7] = order(broken[7].date, { itemid: "cola" });
    assert.equal(earns("Creature of Habit", data(broken)), false);
});

test("Brand Ambassador: 50 of one drink", () => {
    const mixed = repeated(50, "2026-09-24T10:00:00Z").map((o, i) => (i % 2 ? { ...o, itemid: "cola" } : o));
    assert.equal(earns("Brand Ambassador", data(mixed)), false);
    assert.equal(earns("Brand Ambassador", data(repeated(50, "2026-09-24T10:00:00Z"))), true);
});

test("Sugar Mountain: 1 kg of sugar in total", () => {
    assert.equal(earns("Sugar Mountain", data(repeated(40, "2026-01-01T10:00:00Z", { sugar: 25 }))), true);
    assert.equal(earns("Sugar Mountain", data(repeated(39, "2026-01-01T10:00:00Z", { sugar: 25 }))), false);
});

test("Espresso Machine: 10 g of caffeine in total", () => {
    assert.equal(earns("Espresso Machine", data(repeated(100, "2026-01-01T10:00:00Z", { caffeine: 100 }))), true);
    assert.equal(earns("Espresso Machine", data(repeated(99, "2026-01-01T10:00:00Z", { caffeine: 100 }))), false);
});

test("Hydrated: 10 drinks without sugar and caffeine; unknown values do not count", () => {
    assert.equal(earns("Hydrated", data(repeated(10, "2026-01-01T10:00:00Z", { sugar: 0, caffeine: 0 }))), true);
    assert.equal(earns("Hydrated", data(repeated(9, "2026-01-01T10:00:00Z", { sugar: 0, caffeine: 0 }))), false);
    assert.equal(earns("Hydrated", data(repeated(10, "2026-01-01T10:00:00Z"))), false);
});

test("Clean Week: at least 5 drinks in a week, all sugar-free", () => {
    // Monday 21 September 2026 onwards, same week.
    assert.equal(earns("Clean Week", data(repeated(5, "2026-09-21T10:00:00Z", { sugar: 0 }))), true);
    assert.equal(earns("Clean Week", data(repeated(4, "2026-09-21T10:00:00Z", { sugar: 0 }))), false);
    const oneSweet = repeated(6, "2026-09-21T10:00:00Z", { sugar: 0 });
    oneSweet[3] = { ...oneSweet[3], sugar: 10 };
    assert.equal(earns("Clean Week", data(oneSweet)), false);
});

test("Decaf Day: at least 3 drinks on a day, all caffeine-free", () => {
    assert.equal(earns("Decaf Day", data(repeated(3, "2026-09-24T10:00:00Z", { caffeine: 0 }))), true);
    const oneCaffeinated = repeated(3, "2026-09-24T10:00:00Z", { caffeine: 0 });
    oneCaffeinated[1] = { ...oneCaffeinated[1], caffeine: 50 };
    assert.equal(earns("Decaf Day", data(oneCaffeinated)), false);
});

test("Marathon: 2600 kcal in total, from the drinks' current energy", () => {
    const items = [{ itemid: "mate", itemname: "Mate", quantity: 5, energy: 100 }];
    assert.equal(earns("Marathon", data(repeated(26, "2026-01-01T10:00:00Z"), { items })), true);
    assert.equal(earns("Marathon", data(repeated(25, "2026-01-01T10:00:00Z"), { items })), false);
    // Drinks no longer listed count as 0 kcal.
    assert.equal(earns("Marathon", data(repeated(26, "2026-01-01T10:00:00Z"))), false);
});

test("Big Spender: 100 € in total", () => {
    assert.equal(earns("Big Spender", data(repeated(66, "2026-01-01T10:00:00Z"))), false);
    assert.equal(earns("Big Spender", data(repeated(67, "2026-01-01T10:00:00Z"))), true);
});

test("payment achievements", () => {
    const payment = (fields: Partial<AchievementData["payments"][number]> = {}) => ({
        amountCents: 300,
        ordersCents: 300,
        createdAt: new Date("2026-09-24T10:00:00Z"),
        oldestOrderDate: new Date("2026-09-20T10:00:00Z"),
        ...fields,
    });
    assert.equal(earns("Clean Slate", data([])), false);
    assert.equal(earns("Clean Slate", data([], { payments: [payment()] })), true);

    assert.equal(earns("Tip Jar", data([], { payments: [payment()] })), false);
    assert.equal(earns("Tip Jar", data([], { payments: [payment({ amountCents: 350 })] })), true);

    assert.equal(earns("Good Standing", data([], { payments: [payment()] })), true);
    assert.equal(earns("Good Standing", data([], { payments: [payment({ oldestOrderDate: new Date("2026-09-10T10:00:00Z") })] })), false);
    assert.equal(earns("Good Standing", data([], { payments: [payment({ oldestOrderDate: null })] })), false);
});

test("social achievements come from the precomputed facts", () => {
    for (const [name, fact] of [["Trendsetter", "firstToOrder"], ["Happy Hour", "happyHour"], ["Top of the Month", "topOfMonth"]] as const) {
        assert.equal(earns(name, data(repeated(3, "2026-09-24T10:00:00Z"))), false, name);
        assert.equal(earns(name, data([], { [fact]: true })), true, name);
    }
});

test("Last One is awarded at purchase time, not from the history", () => {
    assert.equal(earns("Last One", data(repeated(600, "2026-01-01T10:00:00Z"))), false);
});
