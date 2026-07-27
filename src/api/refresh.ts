import { Request, Response } from "express";
import { getBearerToken, makeJWT } from "../auth.js";
import { getUserFromRefreshToken, getValidRefreshTokenByToken } from "../db/queries/refreshTokens.js";
import { RefreshToken } from "../db/schema.js";
import { UnauthorizedError } from "../errors.js";
import { config } from "../config.js";

export async function handlerRefresh (req:Request, res: Response){
    const tokenFromHeader = getBearerToken(req);

    const user = await getUserFromRefreshToken(tokenFromHeader);
    if (!user) {
        throw new UnauthorizedError("Invalid or expired refresh token");
    }
    const jwtToken =  makeJWT(user.userId,config.api.jwtSecret);

    res.status(200).json({
        token: jwtToken,
    });
}

