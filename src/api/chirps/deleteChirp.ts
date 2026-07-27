import { Request, Response } from "express";
import { getBearerToken, validateJWT } from "../../auth.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors.js";
import { config } from "../../config.js";
import { deleteChirp, getChirpById } from "../../db/queries/chirps.js";

export async function handlerDeleteChirp (req: Request, res:Response){
    const tokenFromHeader = getBearerToken(req);
    const userId = validateJWT(tokenFromHeader, config.api.jwtSecret);
    const {chirpId} = req.params;

    if(!chirpId || typeof chirpId != "string"){
        throw new BadRequestError("Invalid chirp ID");
    }

    const chirp = await getChirpById(chirpId);
    if(!chirp) 
        throw new NotFoundError("Chirp not found");

    if(chirp.userId !== userId)
        throw new ForbiddenError("Can't delete a chirp isn't yours");

    deleteChirp(chirpId);
    res.status(204).send();
    
}