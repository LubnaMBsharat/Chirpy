import { Request, Response } from "express";
import { getBearerToken } from "../auth.js";
import { updateRevokeAtFromToken } from "../db/queries/refreshTokens.js";
import { UnauthorizedError } from "../errors.js";

export async function handlerRevoke(req:Request, res: Response){
    const tokenFromHeader = getBearerToken(req);
    const refreshToken =await updateRevokeAtFromToken(tokenFromHeader);
    if(!refreshToken){
        throw new UnauthorizedError("Forbidden");
    }

    res.status(204).send();
}