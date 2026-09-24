import assert from "node:assert/strict";
import { test } from "node:test";

import { berlinDay, berlinWeek, startOfBerlinDay } from "../../src/lib/berlin-time.ts";

const iso = (date: Date) => date.toISOString();

test("startOfBerlinDay: summer and winter offsets", () => {
    assert.equal(iso(startOfBerlinDay(new Date("2026-09-24T12:00:00Z"))), "2026-09-23T22:00:00.000Z");
    assert.equal(iso(startOfBerlinDay(new Date("2026-01-15T12:00:00Z"))), "2026-01-14T23:00:00.000Z");
});

test("startOfBerlinDay: after Berlin midnight while UTC is still on the previous day", () => {
    assert.equal(iso(startOfBerlinDay(new Date("2026-09-24T22:30:00Z"))), "2026-09-24T22:00:00.000Z");
});

test("startOfBerlinDay: days on which daylight saving time changes", () => {
    // 29 March 2026: clocks go forward at 02:00, so midnight was still CET.
    assert.equal(iso(startOfBerlinDay(new Date("2026-03-29T12:00:00Z"))), "2026-03-28T23:00:00.000Z");
    assert.equal(iso(startOfBerlinDay(new Date("2026-03-29T00:30:00Z"))), "2026-03-28T23:00:00.000Z");
    // 25 October 2026: clocks go back at 03:00, so midnight was still CEST.
    assert.equal(iso(startOfBerlinDay(new Date("2026-10-25T12:00:00Z"))), "2026-10-24T22:00:00.000Z");
});

test("berlinDay uses the Berlin calendar day", () => {
    assert.equal(berlinDay(new Date("2026-09-24T22:30:00Z")), "2026-09-25");
    assert.equal(berlinDay(new Date("2026-09-24T21:30:00Z")), "2026-09-24");
});

test("berlinWeek: Monday-based and distinct across years", () => {
    assert.equal(berlinWeek(new Date("2026-09-21T08:00:00Z")), berlinWeek(new Date("2026-09-27T20:00:00Z")));
    // Sunday 23:30 UTC is already Monday in Berlin: a new week.
    assert.equal(berlinWeek(new Date("2026-09-27T23:30:00Z")), "2026-09-28");
    // Wednesday 31 Dec and Thursday 1 Jan share a week.
    assert.equal(berlinWeek(new Date("2025-12-31T12:00:00Z")), berlinWeek(new Date("2026-01-01T12:00:00Z")));
    assert.notEqual(berlinWeek(new Date("2025-01-15T12:00:00Z")), berlinWeek(new Date("2026-01-14T12:00:00Z")));
});
