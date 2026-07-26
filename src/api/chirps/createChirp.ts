import { Request, Response } from "express";
import { z } from "zod";
import { BadRequestError, ForbiddenError } from "../../errors.js";
import { createChirp } from "../../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../../auth.js";
import { config } from "../../config.js";

const createChirpSchema = z.object({
    body:z.string(),
})
export async function handlerCreateChirp(req:Request, res:Response){
    const token = getBearerToken(req);
    const userId = validateJWT(token,config.api.jwtSecret);
    const result = createChirpSchema.safeParse(req.body);
    if(!result.success)
        throw new BadRequestError("Invalid data");

    if(!validateChirp(result.data.body)){
        throw new ForbiddenError("The Chirp can't contain bad words");
    }
    const chirpData = {
        ...result.data,
        userId : userId
    }
    const chirp = await createChirp(chirpData);
    res.status(201).json(chirp);
}

function validateChirp (chirp:string){
    //check if the length of the chirp is 140 or less
    if(chirp.length > 140){
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }
    // check if the the chirp contains bad words and replace them with ****
    const profaneWords= ["kerfuffle" , "sharbert" , "fornax"];
    //let reqBody:string = req.body.body;
    const words = chirp.split(" ");

    const cleanWords = words.map((word)=>{
        if(profaneWords.includes(word.toLocaleLowerCase()))
            return false;
        //return true;
    });
    //const cleanBody = cleanWords.join(" ");
    return true;  
}