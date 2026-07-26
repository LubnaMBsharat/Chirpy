import { Request, Response } from "express";
import { getChirpById } from "../../db/queries/chirps.js";
import { BadRequestError, NotFoundError } from "../../errors.js";

export async function handlerGetChirp(req:Request,res:Response){
    const { chirpId } = req.params;
    if(typeof chirpId != "string"){
        throw new BadRequestError("Invalid chirp ID");
    }
    const chirp = await getChirpById(chirpId);
    if(!chirp){
        throw new NotFoundError("Chirp not found");
    }
    res.status(200).json(chirp);
}