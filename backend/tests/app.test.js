import { describe, expect, it } from "vitest";
import request from "supertest";
import createApp from "../src/app.js";

describe("App routes", () => {
  const app = createApp();

  it("returns health status", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
  });

  it("returns api info", async () => {
    const response = await request(app).get("/api/info");
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Todo List API");
  });
});
