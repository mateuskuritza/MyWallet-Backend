import connection from "../database/database.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import authUser from "./authUser.js";

const User = {
	async register(req, res) {
		const { name, email, password } = req.body;
		if (!name || !email || !password) return res.sendStatus(400);
		const existingEmail = (await connection.query(`SELECT * FROM users WHERE email = $1`, [email])).rows;
		if (existingEmail.length > 0) return res.sendStatus(409);
		const hashPassword = bcrypt.hashSync(password, 12);
		await connection.query(`INSERT INTO users (name, email, password) values ($1,$2,$3)`, [name, email, hashPassword]);
		res.sendStatus(201);
	},
	async login(req, res) {
		const { email, password } = req.body;
		if (!email || !password) return res.sendStatus(400);
		const user = (await connection.query(`SELECT * FROM users WHERE email = $1`, [email])).rows[0];

		if (user && bcrypt.compareSync(password, user.password)) {
			const token = uuidv4();
			await connection.query(`DELETE FROM "userToken" WHERE "userId" = $1`, [user.id]);
			await connection.query(`INSERT INTO "userToken" ("userId", token) values ($1,$2)`, [user.id, token]);
			const resp = {
				name: user.name,
				token,
			};
			return res.send(resp);
		}

		res.sendStatus(401);
	},
	async logout(req, res) {
		const authorization = req.headers["authorization"];
		if (!authorization) return res.sendStatus(400);
		const user = await authUser(authorization);
		if (!user) return res.sendStatus(401);
		await connection.query(`DELETE FROM "userToken" WHERE token = $1`, [user.token]);
		res.sendStatus(200);
	},
};

export default User;
