import { config, envOrThrow } from "../config.js";
import { Request,Response } from "express";
import { deleteAllUsers } from "../db/queries/users.js";
import { ForbiddenError } from "../errors.js";

export async function handlerReset(req:Request, res:Response){
    const platform = envOrThrow("PLATFORM");
    //make this endpoint only accessible in a local development environment
    if(platform !== "dev")
        throw new ForbiddenError("Not allowed");
    
    config.api.fileserverHits = 0;
    await deleteAllUsers();

    res.status(200).send("Reset the users table and the hits");

    //res.set("Content-Type","text/plain; charset=utf-8");
    //res.send("Hits reset to 0");
}