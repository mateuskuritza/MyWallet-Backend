import app from "../app";
import supertest from "supertest";

async function createUser() {
	const obj = {
		name: "teste",
		email: "teste@teste.com",
		password: "123",
	};
	await supertest(app).post("/user/register").send(obj);
	return obj;
}

export default createUser;
