import * as argon2  from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "./errors.js";
import { Request } from "express";
import crypto from "crypto";

// we used this sub type from the JwtPayload type to narrow the type down to the keys we care about
type Payload = Pick <JwtPayload, "iss"| "sub" | "iat" | "exp">;
export async function hashPassword(password:string): Promise<string>{
    const hashedPassword = await argon2.hash(password);
    return hashedPassword;
}

//compare the password in the HTTP request with the password that is stored in the database.
export async function checkPasswordHash(password:string , hash: string): Promise<boolean>{
    const result = await argon2.verify(hash,password);
    return result;
}

export function makeJWT(userID: string, secret:string): string{
    // get the current time in seconds.
    const iat = Math.floor(Date.now()/1000);
    const payload: Payload = {
        iss: "chirpy",
        sub: userID,
        iat: iat,
        exp: iat + 3600
    };
    const token = jwt.sign(payload,secret);
    return token;
}
export function validateJWT(tokenString: string, secret: string) : string {
    let decodedToken : Payload;
    try{
        decodedToken = jwt.verify(tokenString,secret) as Payload;

    }
    catch(err){
        throw new UnauthorizedError("Invalid or expired token");
    }

    if(!decodedToken.sub){
        throw new UnauthorizedError("Invalid token");
    }
    return decodedToken.sub;
}
export function getBearerToken(req:Request): string{
    const authHeader = req.get("Authorization")
    if(!authHeader){
        throw new UnauthorizedError("Authorization header requested");
    }

    const barerToken = authHeader.replace('Bearer',"").trim();
    if(! barerToken){
        throw new UnauthorizedError("Authorization header requested");
    }
    return barerToken;
}

export function makeRefreshToken(): string{
    const hexData = crypto.randomBytes(32);
    return hexData.toString("hex");
}

//this will be used to get the APIKey from the req header for webhook from polka
export function getAPIKey(req:Request){
    const authHeader = req.get("Authorization");

    if(!authHeader)
        throw new UnauthorizedError("Authorization header requested");

    const apiKey = authHeader.replace("ApiKey","").trim();
    if(!apiKey)
        throw new UnauthorizedError("API key is requested");
    return apiKey;
}

