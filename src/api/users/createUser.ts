import { Request, Response } from "express";
import {z} from "zod";
import { BadRequestError } from "../../errors.js";
import { createUser } from "../../db/queries/users.js";
import { hashPassword } from "../../auth.js";
import { UserResponse } from "../../db/schema.js";

const createUserSchema = z.object({
    email:z.email(),
    password: z.string()
});

export async function handlerCreateUser(req:Request,res:Response){
    // I used safeParse so the zod won't throw ZodError because I want to throw a custom error
    const result = createUserSchema.safeParse(req.body);
    if(!result.success){
        throw new BadRequestError("Invalid Email");
    }
    const hashedPassword = await hashPassword(result.data.password);
    const user: UserResponse = await createUser({
        email: result.data.email,
        hashedPassword: hashedPassword
    });
    // if any error occurred it will go direct to the middlewareErrorHandler
    res.status(201).json(user);
}