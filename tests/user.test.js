import supertest from "supertest";
import app from "../src/app.js";
import connection from "../src/database/database.js";
/*
beforeEach(async () => {
    await connection.query("DELETE FROM ")
});

afterAll( () => connection.end());
*/
describe("GET /banana", () => {
	it("return status 200", async () => {
		const result = await supertest(app).get("/banana");
		expect(result.status).toEqual(200);
	});
});

describe("POST /register", () => {
	it("return 400 invalid password", async () => {
		const obj = {
			name: "teste jest",
			email: "teste@teste.com",
			password: "",
		};
		const result = await supertest(app).post("/register").send(obj);
		expect(result.status).toEqual(400);
	});
	it("return 400 invalid email", async () => {
		const obj = {
			name: "teste jest",
			email: "",
			password: "123",
		};
		const result = await supertest(app).post("/register").send(obj);
		expect(result.status).toEqual(400);
	});
	it("return 400 invalid name", async () => {
		const obj = {
			name: "",
			email: "teste@teste.com",
			password: "123",
		};
		const result = await supertest(app).post("/register").send(obj);
		expect(result.status).toEqual(400);
	});
	it("return 409 existing email", async () => {
		const obj = {
			name: "teste",
			email: "teste@teste.com",
			password: "123",
		};
		await supertest(app).post("/register").send(obj);
		const obj2 = {
			name: "teste2",
			email: "teste23@teste.com",
			password: "1234",
		};
		const result2 = await supertest(app).post("/register").send(obj2);
		expect(result2.status).toEqual(409);
	});
});
