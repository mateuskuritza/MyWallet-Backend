import express from "express";
const routes = express.Router();

import User from "../controller/usersController.js";
import Register from "../controller/registerController.js";

routes.post("/user/register", User.register);

routes.post("/user/login", User.login);

routes.post("/user/logout", User.logout);

routes.get("/registers", Register.registers);

routes.post("/registers/:type", Register.newRegister);

export default routes;
