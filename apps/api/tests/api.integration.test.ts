import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const runIntegration = process.env.RUN_API_TESTS === "true";
const describeApi = runIntegration ? describe : describe.skip;

describeApi("VocabNest API integration", () => {
  let app: any;
  let prisma: any;
  let token: string;
  let vocabularyId: string;
  let groupId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.OPENAI_API_KEY = "";

    const appModule = await import("../src/app");
    const dbModule = await import("../src/db/prisma");
    app = appModule.app;
    prisma = dbModule.prisma;

    await prisma.user.deleteMany({ where: { email: "integration@vocabnest.local" } });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({ where: { email: "integration@vocabnest.local" } });
      await prisma.$disconnect();
    }
  });

  it("registers, logs in, and returns current user", async () => {
    const registerResponse = await request(app).post("/auth/register").send({
      email: "integration@vocabnest.local",
      name: "Integration User",
      password: "password123",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.data.accessToken).toEqual(expect.any(String));

    const loginResponse = await request(app).post("/auth/login").send({
      email: "integration@vocabnest.local",
      password: "password123",
    });

    expect(loginResponse.status).toBe(200);
    token = loginResponse.body.data.accessToken;

    const meResponse = await request(app).get("/auth/me").set("Authorization", `Bearer ${token}`);
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.email).toBe("integration@vocabnest.local");
  });

  it("searches vocabulary in mock mode and saves it", async () => {
    const searchResponse = await request(app)
      .post("/vocabulary/search")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: "negotiate" });

    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.data.demoMode).toBe(true);

    const saveResponse = await request(app)
      .post("/vocabulary")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...searchResponse.body.data.result,
        difficulty: "medium",
        favorite: true,
      });

    expect(saveResponse.status).toBe(201);
    vocabularyId = saveResponse.body.data.id;
  });

  it("creates a group and assigns vocabulary to it", async () => {
    const groupResponse = await request(app)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Business", color: "#2563eb" });

    expect(groupResponse.status).toBe(201);
    groupId = groupResponse.body.data.id;

    const assignResponse = await request(app)
      .post(`/vocabulary/${vocabularyId}/groups`)
      .set("Authorization", `Bearer ${token}`)
      .send({ groupIds: [groupId] });

    expect(assignResponse.status).toBe(200);
    expect(assignResponse.body.data.groups).toEqual([
      expect.objectContaining({ id: groupId, name: "Business" }),
    ]);
  });

  it("gets today's practice and reviews an item", async () => {
    const practiceResponse = await request(app)
      .get("/practice/today")
      .set("Authorization", `Bearer ${token}`);

    expect(practiceResponse.status).toBe(200);
    expect(practiceResponse.body.data.items.length).toBeLessThanOrEqual(10);
    expect(practiceResponse.body.data.items.length).toBeGreaterThan(0);

    const item = practiceResponse.body.data.items[0];
    const reviewResponse = await request(app)
      .post(`/practice/${practiceResponse.body.data.id}/items/${item.id}/review`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: "good" });

    expect(reviewResponse.status).toBe(200);
    expect(reviewResponse.body.data.rating).toBe("good");
  });
});
