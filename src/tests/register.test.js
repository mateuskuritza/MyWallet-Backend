import supertest from "supertest";
import app from "../app.js";
import connection from "../database/database.js";
import createUser from "./createUser.js";
import loginUser from "./loginUser";

beforeEach(async () => {
	await connection.query("DELETE FROM register");
});

afterAll(() => connection.end());

describe("GET registers", () => {
	it("return 400 invalid authorization", async () => {
		const result = await supertest(app).get("/registers").set("Authorization", "");
		expect(result.status).toEqual(400);
	});
	it("return 401 invalid token", async () => {
		const result = await supertest(app).get("/registers").set("Authorization", "Bearer faketoken");
		expect(result.status).toEqual(401);
	});
	it("return object when successful", async () => {
		const newUser = await createUser();
		const newToken = await loginUser(newUser.email, newUser.password);
		const result = await supertest(app).get("/registers").set("Authorization", `Bearer ${newToken}`);
		const schema = {
			registers: expect.any(Array),
			balance: expect.any(Number),
		};
		expect(result.body).toMatchObject(schema);
	});
});
