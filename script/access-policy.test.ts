import { test } from "node:test";
import assert from "node:assert/strict";
import { canOpenWorkspace, canReadFinancialRecord } from "../shared/access-policy";
import jwt from "jsonwebtoken";
import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from "../server/core/auth.middleware";

test("workspace routes enforce roles, not merely signed-in status", () => {
  for (const role of ["donor", "user"]) for (const path of ["/admin", "/employee", "/delivery"]) assert.equal(canOpenWorkspace(role, path), false);
  assert.equal(canOpenWorkspace("accountant", "/employee/donations"), true);
  assert.equal(canOpenWorkspace("sales", "/employee/donations"), false);
  assert.equal(canOpenWorkspace("employee", "/admin/settings"), false);
  assert.equal(canOpenWorkspace("admin", "/admin/settings"), true);
  assert.equal(canOpenWorkspace("programmer", "/employee/tasks"), true);
});

test("financial records allow owner or authorized finance staff only", () => {
  assert.equal(canReadFinancialRecord({ id: "a", role: "donor" }, { userId: "a" }), true);
  assert.equal(canReadFinancialRecord({ id: "a", role: "donor" }, { userId: "b" }), false);
  assert.equal(canReadFinancialRecord({ id: "a", role: "employee" }, { userId: "b" }), false);
  assert.equal(canReadFinancialRecord({}, {}), false);
  assert.equal(canReadFinancialRecord({ id: "a", role: "accountant" }, { userId: "b" }), true);
});

test("known legacy JWT key cannot forge admin access; token domains differ", () => {
  const token = jwt.sign({ userId: "a", role: "admin" }, "twaq_jwt_secret_2024_secure");
  assert.throws(() => verifyAccessToken(token));
  const valid = generateAccessToken({ userId: "a", role: "donor" });
  assert.equal(verifyAccessToken(valid).role, "donor");
  assert.throws(() => verifyRefreshToken(valid));
});
