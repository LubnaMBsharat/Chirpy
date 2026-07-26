import { Request, Response } from "express";
import { getAllChirps } from "../../db/queries/chirps.js";
import { NotFoundError } from "../../errors.js";

export async function handlerGetAllChirps (req:Request, res:Response){
    const result = await getAllChirps();
    if(!result || result.length ==0){
        throw new NotFoundError("Chirps not found");
    }
    res.status(200).json(result);
}