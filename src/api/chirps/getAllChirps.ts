import { Request, Response } from "express";
import { getAllChirps } from "../../db/queries/chirps.js";
import { NotFoundError } from "../../errors.js";

export async function handlerGetAllChirps (req:Request, res:Response){
    let authorId: string | undefined = undefined;
    // get the author id from the query parameters
    let authorIdQuery = req.query.authorId

    // to make sure it's string 
    if(typeof authorIdQuery === "string")
        authorId = authorIdQuery;

    let sortOrder: "asc" | "desc" = "asc";
    const sortQuery = req.query.sort;
    if (sortQuery === "desc") {
        sortOrder = "desc";
    }

    const result = await getAllChirps(authorId);
    if(!result || result.length ==0){
        throw new NotFoundError("Chirps not found");
    }
    result.sort((a, b) => {
        if (sortOrder === "asc") {
            // if the result is negative number then a before b
            return a.createdAt.getTime() - b.createdAt.getTime();
        } else {
            // if the result is positive number then b before a
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
    });    

    res.status(200).json(result);
}