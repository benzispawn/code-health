import { describe, expect, it } from "vitest";
import { extractSpecExpectations } from "../../src/core/spec/spec-validator";

describe("extractSpecExpectations", () => {
  it("extracts implementation artifacts, methods, and decorators", () => {
    const expectations = extractSpecExpectations(`project:
  name: email-saas
domains:
  - name: billing
    path: src/billing
    controllers:
      - name: BillingController
        routes:
          - handler: changePlan
    services:
      - name: BillingService
        methods:
          - name: changePlan
    decorators:
      - name: CurrentUser
`);

    expect(expectations).toEqual([
      { kind: "identifier", name: "BillingController" },
      { kind: "method", name: "changePlan" },
      { kind: "identifier", name: "BillingService" },
      { kind: "identifier", name: "CurrentUser" },
    ]);
  });

  it("ignores project and domain metadata names", () => {
    const expectations = extractSpecExpectations(`project:
  name: email-saas
domains:
  - name: billing
    path: src/billing
`);

    expect(expectations).toEqual([]);
  });
});
