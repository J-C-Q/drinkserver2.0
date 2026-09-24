import assert from "node:assert/strict";
import { test } from "node:test";

import { formatCents, parseEuros } from "../../src/lib/money.ts";

test("formatCents", () => {
    assert.equal(formatCents(150), "1.50");
    assert.equal(formatCents(20529), "205.29");
    assert.equal(formatCents(0), "0.00");
    assert.equal(formatCents(-50), "-0.50");
});

test("parseEuros accepts dot or comma and up to two decimals", () => {
    assert.equal(parseEuros("12.50"), 1250);
    assert.equal(parseEuros("12,5"), 1250);
    assert.equal(parseEuros(" 3 "), 300);
    assert.equal(parseEuros("0.07"), 7);
    // No floating point: 0.1 + 0.2 style inputs stay exact.
    assert.equal(parseEuros("205.29"), 20529);
});

test("parseEuros rejects anything else", () => {
    for (const input of ["", "abc", "1.234", "-1", "1e3", "1.2.3", "1234567"]) {
        assert.equal(parseEuros(input), null, input);
    }
});
