import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

const expectedTokens = [
  "--schedule-cell-width:44px;",
  "--schedule-row-height:53px;",
  "--schedule-side-width:80px;",
  "--schedule-gap-width:18px;",
  "--schedule-arrow-height:48px;",
  "--schedule-event-grid-offset:calc(var(--schedule-cell-width) / 2);",
];

for (const token of expectedTokens) {
  assert.ok(html.includes(token), `Missing reference layout token: ${token}`);
}

assert.ok(
  html.includes('function leadGap('),
  "Interval rows need a lead gap helper.",
);
assert.ok(
  html.includes('function trailGap('),
  "Instant rows need a trailing gap helper.",
);
assert.ok(
  !html.includes('function originSpacer('),
  "A single global spacer shifts instant rows and must not exist.",
);
assert.ok(
  html.includes('html += `<tr><td class="leftlabel">Res.</td>${leadGap()}'),
  "Res. must use the leading interval gap.",
);
assert.ok(
  html.includes('html += `<tr><td class="leftlabel">#tic</td>${leadGap()}'),
  "#tic must use the leading interval gap.",
);
assert.ok(
  html.includes('html += `<tr><td class="leftlabel">CPU:</td>${leadGap()}'),
  "CPU must use the leading interval gap.",
);
assert.ok(
  html.includes('html += `<tr><td class="leftlabel">t'),
  "Time rows must still exist.",
);
assert.ok(
  html.includes('${trailGap("gray-gap")}<td class="rightlabel">tᵢ</td></tr>') ||
    html.includes('${trailGap("gray-gap")}<td class="rightlabel">táµ¢</td></tr>') ||
    html.includes('${trailGap("gray-gap")}<td class="rightlabel">tÃ¡ÂµÂ¢</td></tr>') ||
    html.includes('${trailGap("gray-gap")}<td class="rightlabel">tÃƒÂ¡Ã‚ÂµÃ‚Â¢</td></tr>'),
  "Instant-based t rows must end with the trailing gap, not start with a spacer.",
);
assert.ok(
  html.includes('${trailGap("event-gap")}<td class="rightlabel ${color}">D${superscript(taskNo)}<sub>i</sub></td></tr>'),
  "Deadline rows must align to instants and finish with the trailing gap.",
);
assert.ok(
  html.includes('${trailGap("event-gap")}<td class="rightlabel ${color}">Req${superscript(taskNo)}<sub>i</sub></td></tr>'),
  "Request rows must align to instants and finish with the trailing gap.",
);
assert.ok(
  html.includes(".schedule .tick,\n  .schedule .timeindex{") &&
    html.includes("background:var(--gray);"),
  "#tic and time number rows must be gray like the reference.",
);
assert.ok(
  html.includes("left:100%;"),
  "Instant stems and markers must align with the next interval boundary.",
);
assert.ok(
  html.includes(".schedule .eventrow,\n  .schedule .reqrow{") &&
    html.includes("transform:translateX(var(--schedule-event-grid-offset));"),
  "Only D/Req timeline cells should receive the half-cell visual shift.",
);
assert.ok(
  html.includes('cell(`<span class="instant-marker time-marker">${t}</span>`, "timeindex")'),
  "Time-index numbers must use the shared instant-boundary marker.",
);
assert.ok(
  html.includes(".instant-marker.time-marker{") &&
    html.includes("background:var(--gray);"),
  "Time markers need a gray line cutout.",
);
assert.ok(
  html.includes('text = `<span class="instant-marker event-marker">${taskNo}</span>`;'),
  "Initial execution numbers must use the shared instant-boundary marker.",
);
assert.ok(
  html.includes(".instant-marker.event-marker{"),
  "Event markers need a dedicated local line cutout.",
);
assert.ok(
  html.includes(".schedule .eventrow .event-marker,\n  .schedule .reqrow .event-marker{") &&
    html.includes("transform:translate(calc(-50% - var(--schedule-event-grid-offset)), -50%)"),
  "D/Req markers must stay on their original instant while their cells shift.",
);
assert.ok(
  html.includes(".instant-marker{") &&
    html.includes("z-index:2;"),
  "Boundary-centered markers must paint above adjacent table cells.",
);
assert.ok(
  html.includes(".schedule .time-arrow::before{"),
  "The bottom arrow needs a vertical start cap aligned with time 0.",
);
assert.ok(
  html.includes(".schedule .tick,\n    .schedule .cpu,\n    .schedule .timeindex,\n    .schedule .axis,"),
  "Print styles must explicitly override the enlarged schedule row classes.",
);
assert.ok(
  html.includes(".schedule .titlecell{ height:30px; font-size:12px; }"),
  "Print styles must preserve the compact title-row height.",
);

console.log("Schedule reference geometry is present.");
