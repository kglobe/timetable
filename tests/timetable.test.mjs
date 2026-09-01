import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import vm from "node:vm";

const read = path => readFileSync(path, "utf8");

function eventsContext() {
  const context = vm.createContext({ console, Date });
  vm.runInContext(read("events.js"), context);
  return context;
}

test("holidayEventOn returns the holiday covering a date", () => {
  const context = eventsContext();
  const name = vm.runInContext(
    "holidayEventOn(new Date(2026, 8, 25))[2]",
    context,
  );
  assert.equal(name, "中秋節放假 1 天");
});

test("nextSchoolDay skips a holiday weekend and the following holiday", () => {
  const context = eventsContext();
  const key = vm.runInContext(
    "schoolDateKey(nextSchoolDay(new Date(2026, 8, 25)))",
    context,
  );
  assert.equal(key, "2026-09-29");
});

test("contrast checker succeeds for every current page", () => {
  const result = spawnSync("python", ["check-contrast.py"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("deployable pages do not contain the student name", () => {
  const privateName = "\u6893\u742a";
  for (const page of ["index.html", "calendar.html", "school.html", "snack.html"]) {
    assert.equal(read(page).includes(privateName), false, page);
  }
});

test("GSAP is optional and never preloaded ahead of page content", () => {
  const pages = ["index.html", "calendar.html", "school.html", "snack.html"];
  for (const page of pages) {
    assert.doesNotMatch(read(page), /<link[^>]+rel="preload"[^>]+gsap/i, page);
  }

  for (const page of ["calendar.html", "school.html"]) {
    assert.doesNotMatch(read(page), /\bgsap\b/i, page);
  }

  for (const page of ["index.html", "snack.html"]) {
    const tag = read(page).match(/<script[^>]+src="[^"]*gsap[^>]*>/i)?.[0] ?? "";
    assert.match(tag, /\basync\b/i, page);
  }
});
