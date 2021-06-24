import connection from "./database/database.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());

app.post("/user/register", async (req, res) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password) return res.sendStatus(400);
	const existingEmail = (await connection.query(`SELECT * FROM users WHERE email = $1`, [email])).rows;
	if (existingEmail.length > 0) return res.sendStatus(409);
	const hashPassword = bcrypt.hashSync(password, 12);
	await connection.query(`INSERT INTO users (name, email, password) values ($1,$2,$3)`, [name, email, hashPassword]);
	res.sendStatus(201);
});

app.post("/user/login", async (req, res) => {
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
});

app.post("/user/logout", async (req, res) => {
	const authorization = req.headers["authorization"];
	if (!authorization) return res.sendStatus(400);
	const user = await authUser(authorization);
	if (!user) return res.sendStatus(401);
	await connection.query(`DELETE FROM "userToken" WHERE token = $1`, [user.token]);
});

app.get("/registers", async (req, res) => {
	const authorization = req.headers["authorization"];
	if (!authorization) return res.sendStatus(400);
	const user = await authUser(authorization);
	if (!user) return res.sendStatus(401);
	const registers = (await connection.query(`SELECT * FROM register WHERE "userId" = $1`, [user.id])).rows;

	const revenue = (
		await connection.query(`SELECT SUM(value) AS total FROM register WHERE register.type='revenue' AND register."userId"=$1`, [
			user.id,
		])
	).rows[0];
	const expense = (
		await connection.query(`SELECT SUM(value) AS total FROM register WHERE register.type='expense' AND register."userId"=$1`, [
			user.id,
		])
	).rows[0];
	const balance = (revenue.total - expense.total).toFixed(2);
	const resp = {
		registers,
		balance,
	};
	console.log(resp);
	res.send(resp);
});

app.post("/registers/:type", async (req, res) => {
	const authorization = req.headers["authorization"];
	const { description, value } = req.body;
	const { type } = req.params;
	if (!description || !value || !["revenue", "expense"].includes(type) || !authorization) return res.sendStatus(400);
	const user = await authUser(authorization);
	if (!user) return res.sendStatus(401);
	const today = new Date();
	await connection.query(`INSERT INTO register (date, description, value, type, "userId") values ($1,$2,$3,$4,$5)`, [
		today,
		description,
		value,
		type,
		user.id,
	]);
	res.sendStatus(201);
});

async function authUser(authorization) {
	const token = authorization.replace("Bearer ", "");
	const user = (
		await connection.query(
			`
    SELECT * FROM "userToken"
    JOIN users
    ON "userToken"."userId" = users.id
    WHERE "userToken".token = $1`,
			[token]
		)
	).rows[0];
	return user;
}

export default app;
