import { Request , Response} from "express";
import {z} from "zod";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../errors.js";
import { upgradeUserToChirpyRed } from "../../db/queries/users.js";
import { getAPIKey } from "../../auth.js";
import { config } from "../../config.js";

const webhookSchema = z.object({
    event: z.string(),
    data: z.object({
        userId: z.string()
    })
})
export async function handlerWebhook (req:Request, res: Response){
    const result = webhookSchema.safeParse(req.body);
    if(!result.success)
        throw new BadRequestError("Invalid webhook payload");

    const apiKey = getAPIKey(req);
    if(apiKey !== config.api.polkaKey)
        throw new UnauthorizedError("Invalid API Key");
    
    // we only care about user.upgraded event, we don't care about any other events.
    if(result.data.event !== "user.upgraded")
    {
        res.status(204).send();
        return;
    }

    const chirpyRedUser = await  upgradeUserToChirpyRed(result.data.data.userId);

    if(!chirpyRedUser)
        throw new NotFoundError("User not found");

    // the user upgraded successfully 
    res.status(204).send();

    //If the response code is anything other than 2XX, Polka will retry the request.
}