#!/usr/bin/env node
/**
 * CI Metrics Extractor
 * Parses GitHub Actions workflow logs to extract:
 * - Duration per layer (kernel, integration, build)
 * - First-attempt pass rate
 * - Failure category by layer
 * Outputs JSON for dashboarding / alerting
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REPO = "daniel-castilho/url-shortener-web";
const WORKFLOW = "CI";
const DEFAULT_RUNS = 20;

function ghApi(args) {
  try {
    return execSync(`gh api ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch (e) {
    return null;
  }
}

function getWorkflowRuns(limit = DEFAULT_RUNS) {
  const out = ghApi(`/repos/${REPO}/actions/workflows/${WORKFLOW}.yml/runs?per_page=${limit}&branch=main`);
  if (!out) return [];
  const { workflow_runs } = JSON.parse(out);
  return workflow_runs.filter(r => r.conclusion !== "cancelled");
}

function getJobLogs(runId) {
  const out = ghApi(`/repos/${REPO}/actions/runs/${runId}/jobs`);
  if (!out) return [];
  const { jobs } = JSON.parse(out);
  return jobs.filter(j => j.name === "Lint + Typecheck + Test + Integration + Build");
}

function parseStepLogs(steps, layer) {
  const step = steps.find(s => s.name.toLowerCase().includes(layer.toLowerCase()));
  if (!step) return null;

  const logs = step.logs || "";
  const durationMs = step.completed_at && step.started_at
    ? new Date(step.completed_at) - new Date(step.started_at)
    : null;

  // Extract pass/fail counts from test output
  let passed = 0, failed = 0, skipped = 0;
  const passMatch = logs.match(/pass\s+(\d+)/i);
  const failMatch = logs.match(/fail\s+(\d+)/i);
  const skipMatch = logs.match(/skipped\s+(\d+)/i);
  if (passMatch) passed = parseInt(passMatch[1], 10);
  if (failMatch) failed = parseInt(failMatch[1], 10);
  if (skipMatch) skipped = parseInt(skipMatch[1], 10);

  // Failure category detection
  let category = "unknown";
  if (failed > 0) {
    if (logs.includes("TypeError") || logs.includes("typecheck")) category = "type";
    else if (logs.includes("SyntaxError") || logs.includes("ESLint") || logs.includes("lint")) category = "lint";
    else if (logs.includes("ApiError") || logs.includes("401") || logs.includes("403") || logs.includes("404")) category = "api";
    else if (logs.includes("timeout") || logs.includes("Timeout")) category = "timeout";
    else if (logs.includes("AssertionError") || logs.includes("expect(")) category = "assertion";
    else category = "test";
  }

  return {
    layer,
    durationMs,
    passed,
    failed,
    skipped,
    total: passed + failed + skipped,
    passRate: (passed + failed + skipped) > 0 ? passed / (passed + failed + skipped) : 1,
    category: failed > 0 ? category : "pass",
  };
}

function extractMetrics(jobs) {
  const layers = ["lint", "typecheck", "test (kernel)", "integration tests", "build"];
  const metrics = { timestamp: new Date().toISOString(), layers: {}, summary: {} };

  for (const job of jobs) {
    for (const layer of layers) {
      const parsed = parseStepLogs(job.steps || [], layer);
      if (parsed) metrics.layers[layer] = parsed;
    }
  }

  // Summary
  const allPassed = Object.values(metrics.layers).reduce((sum, l) => sum + l.passed, 0);
  const allFailed = Object.values(metrics.layers).reduce((sum, l) => sum + l.failed, 0);
  const allTotal = Object.values(metrics.layers).reduce((sum, l) => sum + l.total, 0);

  metrics.summary = {
    totalTests: allTotal,
    totalPassed: allPassed,
    totalFailed: allFailed,
    overallPassRate: allTotal > 0 ? allPassed / allTotal : 1,
    durationMs: Object.values(metrics.layers).reduce((sum, l) => sum + (l.durationMs || 0), 0),
    failureCategories: Object.values(metrics.layers)
      .filter(l => l.category !== "pass")
      .reduce((acc, l) => { acc[l.category] = (acc[l.category] || 0) + 1; return acc; }, {}),
  };

  return metrics;
}

function main() {
  const runs = getWorkflowRuns(10);
  if (runs.length === 0) {
    console.error("No workflow runs found");
    process.exit(1);
  }

  // Use latest successful run
  const latestRun = runs.find(r => r.conclusion === "success") || runs[0];
  console.log(`Analyzing run ${latestRun.id} (${latestRun.conclusion})`);

  const jobs = getJobLogs(latestRun.id);
  if (jobs.length === 0) {
    console.error("No matching jobs found");
    process.exit(1);
  }

  const metrics = extractMetrics(jobs);
  const outPath = path.join(__dirname, "../ci-metrics.json");
  fs.writeFileSync(outPath, JSON.stringify(metrics, null, 2));
  console.log(`Metrics written to ${outPath}`);
  console.log(JSON.stringify(metrics.summary, null, 2));
}

main();
