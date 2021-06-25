import connection from "../database/database.js";
import { v4 } from "uuid";

async function loginUser(email, password) {
	const user = (await connection.query(`SELECT * FROM users WHERE email = $1`, [email])).rows[0];
	const token = v4();
	await connection.query(`INSERT INTO "userToken" ("userId", token) values ($1,$2)`, [user.id, token]);
	return token;
}

export default loginUser;