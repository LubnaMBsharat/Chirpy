import { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js"

export function middlewareLogResponses(req:Request,res:Response, next:NextFunction){
    //listen for finish event on the response object
    res.on("finish", ()=>{
        if(res.statusCode >= 400){
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`)
        }
    });
    next(); 
}

export function middlewareMetricsInc(req:Request, res:Response, next: NextFunction){
    config.api.fileserverHits++;
    next();
}

export function middlewareErrorHandler(err: Error,req: Request, res:Response , next: NextFunction){
    console.log(err.message);
    if(err instanceof BadRequestError)
        res.status(err.code).json({error: err.message});
    else if (err instanceof UnauthorizedError)
        res.status(err.code).json({error: err.message});
    else if (err instanceof ForbiddenError)
        res.status(err.code).json({error: err.message});
    else if (err instanceof NotFoundError)
        res.status(err.code).json({error: err.message});
    else 
        res.status(500).json({error: "Something went wrong on our end"});
}