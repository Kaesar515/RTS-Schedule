import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");

function extractFunction(name, nextName) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf(`function ${nextName}(`, start);

  assert.notEqual(start, -1, `Missing function ${name}`);
  assert.notEqual(end, -1, `Missing function after ${name}: ${nextName}`);

  return source.slice(start, end);
}

const makeJobs = eval(`(${extractFunction("makeJobs", "scheduleEDD")})`);
const scheduleEDD = eval(`(${extractFunction("scheduleEDD", "scheduleEDF")})`);
const scheduleEDF = eval(`(${extractFunction("scheduleEDF", "scheduleRMS")})`);
const scheduleRMS = eval(`(${extractFunction("scheduleRMS", "computeSolution")})`);
const detectMisses = eval(`(${extractFunction("detectMisses", "getHorizon")})`);

const policyDifferenceTasks = [
  { id: 1, exec: 4, deadline: 10, period: 100 },
  { id: 2, exec: 1, deadline: 3, period: 3 },
];

assert.deepEqual(
  scheduleEDD(policyDifferenceTasks, 10).timeline,
  [2, 1, 1, 1, 1, 2, 2, null, null, 2],
  "EDD must not preempt Task 1 when Task 2 is released at t=3.",
);

assert.deepEqual(
  scheduleEDF(policyDifferenceTasks, 10).timeline,
  [2, 1, 1, 2, 1, 1, 2, null, null, 2],
  "EDF must preempt Task 1 at t=3 for Task 2's earlier absolute deadline.",
);

const rmsPolicyDifferenceTasks = [
  { id: 1, exec: 1, deadline: 50, period: 4 },
  { id: 2, exec: 2, deadline: 2, period: 10 },
];

assert.deepEqual(
  scheduleRMS(rmsPolicyDifferenceTasks, 6).timeline,
  [1, 2, 2, null, 1, null],
  "RMS must choose the shortest-period ready task, not the earliest absolute deadline.",
);

assert.deepEqual(
  scheduleEDF(rmsPolicyDifferenceTasks, 6).timeline,
  [2, 2, 1, null, 1, null],
  "EDF must still choose by absolute deadline for the same task set.",
);

const orderingTasks = [
  { id: 1, exec: 2, deadline: 8, period: 100 },
  { id: 2, exec: 1, deadline: 3, period: 100 },
  { id: 3, exec: 1, deadline: 5, period: 100 },
];

const expectedOrdering = [2, 3, 1, 1, null, null];

assert.deepEqual(scheduleEDD(orderingTasks, 6).timeline, expectedOrdering);
assert.deepEqual(scheduleEDF(orderingTasks, 6).timeline, expectedOrdering);

assert.deepEqual(
  scheduleEDF([{ id: 1, exec: 1, deadline: 4, period: 4 }], 10).timeline,
  [1, null, null, null, 1, null, null, null, 1, null],
  "The processor must remain idle when no job is ready.",
);

assert.deepEqual(
  scheduleRMS(
    [
      { id: 1, exec: 1, deadline: 99, period: 4 },
      { id: 2, exec: 6, deadline: 20, period: 20 },
    ],
    8,
  ).timeline,
  [1, 2, 2, 2, 1, 2, 2, 2],
  "RMS must preempt immediately when a shorter-period job is released.",
);

assert.deepEqual(
  scheduleRMS([{ id: 1, exec: 1, deadline: 99, period: 4 }], 10).jobs.map((job) => job.absDeadline),
  [4, 8, 12],
  "RMS jobs must use the period as their absolute-deadline spacing.",
);

const overloaded = scheduleEDF(
  [{ id: 1, exec: 3, deadline: 2, period: 2 }],
  6,
);

assert.deepEqual(
  detectMisses(overloaded.jobs, 6).map((job) => job.jobNo),
  [0, 1, 2],
  "All jobs with missed deadlines inside the horizon must be reported.",
);

assert.ok(
  source.includes("function syncProblemFromInputs(){"),
  "Solution actions must synchronize the current form values.",
);

assert.ok(
  source.includes("if(!syncProblemFromInputs()) return;"),
  "Solution actions must stop when the current form is invalid.",
);

assert.ok(
  source.includes("return parsed.every(task =>") &&
    source.includes(") ? parsed : null;"),
  "Task parsing must reject invalid rows instead of silently dropping them.",
);

console.log("EDD/EDF/RMS scheduling logic is correct and synchronized.");
