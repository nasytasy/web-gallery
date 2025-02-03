const request = require("supertest");
const { app, server } = require("./server"); // ✅ Import from server2.js

describe("API Tests", () => {
    afterAll(() => {
        server.close(); // ✅ Ensure the server is properly closed after tests
    });

    it("should return all products", async () => {
        const res = await request(app).get("/products.json");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return all comments", async () => {
        const res = await request(app).get("/comments.json");
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe("object");
    });

    it("should add a new comment", async () => {
        const newComment = {
            productId: 1,
            name: "Alice",
            text: "Good"
        };
        const res = await request(app).post("/add-comment").send(newComment);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should return 400 for missing comment fields", async () => {
        const res = await request(app).post("/add-comment").send({ text: "Nice!" });
        expect(res.status).toBe(400);
    });
});
