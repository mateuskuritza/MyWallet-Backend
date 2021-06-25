import Joi from "joi";

const newRegisterSchema = Joi.object({
	description: Joi.string().min(3).required(),
	value: Joi.number().greater(0).required(),
});

const newUserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

export {newRegisterSchema, newUserSchema, loginSchema};