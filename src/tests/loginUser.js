import supertest from "supertest";
import app from "../app";

async function loginUser(email, password) {
	const result = await supertest(app).post("/user/login").send({ email, password });
	return result.body.token;
}

export default loginUser;
