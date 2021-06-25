import supertest from "supertest";
import app from "../app.js";
import connection from "../database/database.js";
import createUser from "./createUser.js";
import loginUser from "./loginUser";

beforeEach(async () => {
	await connection.query("DELETE FROM register");
});

afterAll(async () => {
	await connection.query("DELETE FROM register");
	connection.end();
});

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

describe("POST registers/:type", () =>{
    //!description || !value || !["revenue", "expense"].includes(type) || !authorization
    it("return 201 new revenue", async () => {
        const newUser = await createUser();
		const newToken = await loginUser(newUser.email, newUser.password);
        const newRegister = {
            description: "teste",
            value: 30.5
        }
        const result = await supertest(app).post("/registers/revenue").send(newRegister).set("Authorization", `Bearer ${newToken}`);
        expect(result.status).toEqual(201);
    })
    it("return 201 new expense", async () => {
        const newUser = await createUser();
		const newToken = await loginUser(newUser.email, newUser.password);
        const newRegister = {
            description: "teste",
            value: 30.5
        }
        const result = await supertest(app).post("/registers/expense").send(newRegister).set("Authorization", `Bearer ${newToken}`);
        expect(result.status).toEqual(201);
    })
    it("return 400 invalid description", async () => {
        const newUser = await createUser();
		const newToken = await loginUser(newUser.email, newUser.password);
        const newRegister = {
            description: "",
            value: 30.5
        }
        const result = await supertest(app).post("/registers/revenue").send(newRegister).set("Authorization", `Bearer ${newToken}`);
        expect(result.status).toEqual(400);
    })
    it("return 400 invalid value", async () => {
        const newUser = await createUser();
		const newToken = await loginUser(newUser.email, newUser.password);
        const newRegister = {
            description: "teste",
            value: "teste"
        }
        const result = await supertest(app).post("/registers/revenue").send(newRegister).set("Authorization", `Bearer ${newToken}`);
        expect(result.status).toEqual(400);
    })
})
