import { Request, Response } from "express";
import z, { email } from "zod";
import { BadRequestError, UnauthorizedError } from "../errors.js";
import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "../auth.js";
import { config } from "../config.js";
import { createRefreshToken } from "../db/queries/refreshTokens.js";
import { NewRefreshToken } from "../db/schema.js";

const loginSchema = z.object({
    password : z.string(),
    email: z.email(),
    expiresInSeconds: z.number().int().positive().optional().default(3600)
});
export async function handlerLogin(req: Request, res:Response){
    const result = loginSchema.safeParse(req.body);
    if(!result.success){
        throw new BadRequestError("Email and Password are required")
    }
    const user = await getUserByEmail(result.data.email);

    if(!user){
        throw new UnauthorizedError("incorrect email or password");
    }
    const isCorrectPassword = await checkPasswordHash(result.data.password,user.hashedPassword);
    if(!isCorrectPassword){
        throw new UnauthorizedError("incorrect email or password");
    }
    // correct password and email
    // make sure that the expires duration won't be more than one hour
    const expiresInSeconds = Math.min(result.data.expiresInSeconds, 3600);
    // make jwt to be used on all the auth required requests
    const jwtToken = makeJWT(user.id,config.api.jwtSecret);

    const refToken= makeRefreshToken();
    // insert the refresh token data into the database 
    const refreshToken = await createRefreshToken(refToken, user.id);
    res.status(200).json({
        id:user.id,
        createdAt: user.createdAt,
        updatedAt : user.createdAt,
        email: user.email,
        isChirpyRed: user.isChirpyRed,
        token: jwtToken,
        refreshToken: refreshToken.token
    })
}