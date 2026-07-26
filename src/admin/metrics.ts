import { Request,Response } from "express";
import { config } from "../config.js";

export function handlerHitsLogger (req: Request, res: Response){
    res.set("Content-Type","text/html; charset=utf-8");
    res.send(`
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
            </body>
        </html>`)
   // res.send(`Hits: ${config.fileserverHits}`)
}
