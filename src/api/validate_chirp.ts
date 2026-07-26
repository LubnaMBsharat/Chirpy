import { Request,Response } from "express";
import { BadRequestError } from "../errors.js"


export async function handlerValidateChirp (req:Request,res:Response){
    res.set("Content-Type","application/json");
    //check if the length of the chirp is 140 or less
    if(req.body.body.length > 140){
        throw new BadRequestError("Chirp is too long. Max length is 140");
        /*const resBody = {
        /*    "error": "Chirp is too long"
        }
        const body = JSON.stringify(resBody);
        res.status(400).send(body);
        return;*/
        }
    // check if the the chirp contains bad words and replace them with ****
    const profaneWords= ["kerfuffle" , "sharbert" , "fornax"];
    let reqBody:string = req.body.body;
    const words = reqBody.split(" ");

    const cleanWords = words.map((word)=>{
        if(profaneWords.includes(word.toLocaleLowerCase()))
            return '****';
        return word;
    });
    const cleanBody = cleanWords.join(" ");
    const resBody = {
        "cleanedBody": cleanBody
    }        
    //res.set("Content-Type","application/json");
    const body = JSON.stringify(resBody);
    res.status(200).send(body); 
}
