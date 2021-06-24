import connection from "../database/database.js";

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

export default authUser;
