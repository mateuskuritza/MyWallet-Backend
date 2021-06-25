import supertest from "supertest";
import app from "../app.js";
import connection from "../database/database.js";
import createUser from "./createUser.js";
import loginUser from "./loginUser";

beforeEach(async () => {
	await connection.query("DELETE FROM users");
	await connection.query(`DELETE FROM "userToken"`);
});

afterAll( () => connection.end());

describe("POST /user/register", () => {
	it("return 201 when create new user", async () => {
		const obj = {
			name: "teste",
			email: "teste@teste.com",
			password: "123",
		};
		const result = await supertest(app).post("/user/register").send(obj);
		expect(result.status).toEqual(201);
	});
	it("return 400 invalid password", async () => {
		const obj = {
			name: "teste jest",
			email: "teste@teste.com",
			password: "",
		};
		const result = await supertest(app).post("/user/register").send(obj);
		expect(result.status).toEqual(400);
	});
	it("return 400 invalid email", async () => {
		const obj = {
			name: "teste jest",
			email: "",
			password: "123",
		};
		const result = await supertest(app).post("/user/register").send(obj);
		expect(result.status).toEqual(400);
	});
	it("return 400 invalid name", async () => {
		const obj = {
			name: "",
			email: "teste@teste.com",
			password: "123",
		};
		const result = await supertest(app).post("/user/register").send(obj);
		expect(result.status).toEqual(400);
	});
	it("return 409 existing email", async () => {
		const obj = {
			name: "teste",
			email: "teste@teste.com",
			password: "123",
		};
		await supertest(app).post("/user/register").send(obj);
		const obj2 = {
			name: "teste2",
			email: "teste@teste.com",
			password: "1234",
		};
		const result2 = await supertest(app).post("/user/register").send(obj2);
		expect(result2.status).toEqual(409);
	});
});

describe("POST /user/login", () => {
	it("return 400 invalid email", async () => {
		const obj = {
			name: "teste",
			email: "",
			password: "123",
		};
		const result = await supertest(app).post("/user/login").send(obj);
		expect(result.status).toEqual(400);
	});
	it("return 400 invalid password", async () => {
		const obj = {
			name: "teste",
			email: "teste@teste.com",
			password: "",
		};
		const result = await supertest(app).post("/user/login").send(obj);
		expect(result.status).toEqual(400);
	});
	it("return 401 password or email not registered", async () => {
		const obj = {
			name: "teste",
			email: "teste@teste.com",
			password: "123",
		};
		const result = await supertest(app).post("/user/login").send(obj);
		expect(result.status).toEqual(401);
	});
	it("return object with name and token when successful login", async () => {
		const { name, email, password } = await createUser();
		const result = await supertest(app).post("/user/login").send({ email, password });
		const schema = {
			name,
			token: expect.stringMatching(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/gm),
		};
		expect(result.body).toMatchObject(schema);
	});
});

describe("POST /user/logout", () => {
	it("return 400 invalid authorization", async () => {
		const result = await supertest(app).post("/user/logout").set("Authorization", "");
		expect(result.status).toEqual(400);
	});
	it("return 401 invalid token", async () => {
		const result = await supertest(app).post("/user/logout").set("Authorization", "Bearer faketoken");
		expect(result.status).toEqual(401);
	});
	it("return 200 successful logout", async () => {
		const newUser = await createUser();
		const newToken = await loginUser(newUser.email, newUser.password);
		const result = await supertest(app).post("/user/logout").set("Authorization", `Bearer ${newToken}`);
		expect(result.status).toEqual(200);
	});
});
