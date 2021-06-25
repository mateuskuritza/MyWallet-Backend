import connection from "../database/database.js";
import bcrypt from "bcrypt";

async function createUser() {
	const name = "teste";
	const email = "teste@teste.com";
	const password = "123";

	await connection.query(`INSERT INTO users (name, email, password) values ($1,$2,$3)`, [name, email, bcrypt.hashSync(password, 10)]);
	return {
		name,
		email,
		password,
	};
}

export default createUser;
