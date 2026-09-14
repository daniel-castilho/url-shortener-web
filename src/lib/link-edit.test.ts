import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPatch } from "./link-edit.ts";

test("buildPatch returns empty object when no field is filled", () => {
  assert.deepEqual(
    buildPatch({
      title: "",
      tags: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmTerm: "",
      utmContent: "",
      expiresAt: "",
    }),
    {},
  );
});

test("buildPatch includes only filled fields with backend-exact names", () => {
  const patch = buildPatch({
    title: "Meu título",
    tags: "",
    utmSource: "newsletter",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    expiresAt: "",
  });
  assert.deepEqual(patch, { title: "Meu título", utm: { source: "newsletter" } });
});

test("buildPatch splits tags, trims and drops empties", () => {
  const patch = buildPatch({
    title: "",
    tags: " promo , ,site_1 ",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    expiresAt: "",
  });
  assert.deepEqual(patch, { tags: ["promo", "site_1"] });
});

test("buildPatch keeps only tags with entries", () => {
  const patch = buildPatch({
    title: "",
    tags: " , ",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    expiresAt: "",
  });
  assert.deepEqual(patch, {});
});

test("buildPatch maps all utm fields to contract names", () => {
  const patch = buildPatch({
    title: "",
    tags: "",
    utmSource: "s",
    utmMedium: "m",
    utmCampaign: "c",
    utmTerm: "t",
    utmContent: "ct",
    expiresAt: "",
  });
  assert.deepEqual(patch, { utm: { source: "s", medium: "m", campaign: "c", term: "t", content: "ct" } });
});

test("buildPatch includes expiresAt when filled", () => {
  const patch = buildPatch({
    title: "",
    tags: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    expiresAt: "2026-12-31T23:59:59Z",
  });
  assert.deepEqual(patch, { expiresAt: "2026-12-31T23:59:59Z" });
});
