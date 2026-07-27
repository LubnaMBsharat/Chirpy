import { Request, Response } from "express";
import { getBearerToken, hashPassword, validateJWT } from "../../auth.js";
import {z} from "zod";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../errors.js";
import { config } from "../../config.js";
import { updateEmailAndPassword } from "../../db/queries/users.js";

const updateUserSchema = z.object({
    email:z.email(),
    password: z.string()
});

export async function handlerUpdateUser(req: Request, res: Response){
    const accessToken = getBearerToken(req);
    const result = updateUserSchema.safeParse(req.body);

    if(! result.success){
        throw new BadRequestError("Email and Password are required");
    }

    const userId = validateJWT(accessToken,config.api.jwtSecret);
    if(!userId){
        throw new UnauthorizedError("Authentication Failed");
    }
    const hashedNewPassword = await hashPassword(result.data.password);
    const updatedUser = await updateEmailAndPassword(userId, result.data.email, hashedNewPassword );

    if(!updatedUser) {
        throw new NotFoundError("User not found");
    }

    res.status(200).json(updatedUser);

}