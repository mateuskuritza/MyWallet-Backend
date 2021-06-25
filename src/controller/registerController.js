import connection from "../database/database.js";
import authUser from "./authUser.js";

const Register = {
	async registers(req, res) {
		const authorization = req.headers["authorization"];
		if (!authorization) return res.sendStatus(400);
		const user = await authUser(authorization);
		if (!user) return res.sendStatus(401);
		const registers = (await connection.query(`SELECT * FROM register WHERE "userId" = $1`, [user.id])).rows;

		const revenue = (
			await connection.query(
				`SELECT SUM(value) AS total FROM register WHERE register.type='revenue' AND register."userId"=$1`,
				[user.id]
			)
		).rows[0];
		const expense = (
			await connection.query(
				`SELECT SUM(value) AS total FROM register WHERE register.type='expense' AND register."userId"=$1`,
				[user.id]
			)
		).rows[0];
		const balance = (revenue.total - expense.total).toFixed(2);
		const resp = {
			registers,
			balance: parseFloat(balance),
		};
		res.send(resp);
	},
	async newRegister(req, res) {
		const authorization = req.headers["authorization"];
		const { description, value } = req.body;
		const { type } = req.params;
		if (!description || !value || !isNaN(value) || value <= 0 || !["revenue", "expense"].includes(type) || !authorization) return res.sendStatus(400);
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
	},
};

export default Register;
