import { describe, expect, it } from "vitest";

import { run } from "../../src/index";

describe("run", () => {
  it("returns the base application health payload", async () => {
    await expect(run()).resolves.toEqual({
      status: "ok",
      service: "azure-devops-connect"
    });
  });
});
