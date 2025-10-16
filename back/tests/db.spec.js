import request from "supertest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../db.js", () => {
  return {
    default: {
      $queryRaw: vi.fn().mockResolvedValue([{ now: "2025-01-01T00:00:00Z" }]),
      $disconnect: vi.fn(),
    },
  };
});

import prisma from "../db.js";
import { createApp } from "../server.js";

describe("GET /db", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.useRealTimers());

  it("retourne l'heure DB mockée", async () => {
    const app = createApp();
    const res = await request(app).get("/db");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ db_time: "2025-01-01T00:00:00Z" });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
