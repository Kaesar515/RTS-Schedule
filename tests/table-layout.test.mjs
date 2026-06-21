import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

const expectedTokens = [
  "--schedule-cell-width:27px;",
  "--schedule-row-height:34px;",
  "--schedule-side-width:51px;",
  "--schedule-gap-width:11px;",
  "--schedule-arrow-height:30px;",
  "--schedule-event-grid-offset:calc(var(--schedule-cell-width) / 2);",
];

const dReqSeparatorRule = `.schedule .eventrow::after,
  .schedule .reqrow::after{
    content:"";
    position:absolute;
    top:0;
    right:0;
    bottom:0;
    width:1px;
    background:var(--grid-light);
    pointer-events:none;
    z-index:1;
  }`;

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
  html.includes('html += `<tr><td class="leftlabel ti-label axis-label" rowspan="2">t') &&
    html.includes('html += `<tr><td class="leftlabel ti-label time-label">t'),
  "Time rows must still exist.",
);
assert.ok(
  html.includes('<td class="trail-gap gray-gap" rowspan="2"></td><td class="rightlabel ti-label axis-label" rowspan="2">') &&
    html.includes('html += `<tr>`;'),
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
  html.includes(dReqSeparatorRule),
  "D/Req cells need a faded non-interactive visual separator layer.",
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
  html.includes("const reqAttrs = rJob") &&
    html.includes('onclick="toggleReqMarker(${taskNo}, ${t})" title="Select task ${taskNo} and toggle ! marker"'),
  "Visible R markers in Req rows must select their task and toggle !.",
);
assert.ok(
  html.includes('onclick="toggleReqMark(${taskNo}, ${t})" title="Click to add/remove ! marker"'),
  "Non-marker Req cells must keep the request-marker toggle behavior.",
);
assert.ok(
  html.includes('text = `<span class="instant-marker event-marker">R${rJob.jobNo}${reqMark.has(key) ? "!" : ""}</span>`;') &&
    html.includes('text = `<span class="instant-marker event-marker">!</span>`;'),
  "Req markers must use !, matching deadline marker behavior.",
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
