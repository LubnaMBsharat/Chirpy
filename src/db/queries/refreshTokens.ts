import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens } from "../schema.js";

export async function createRefreshToken(token: string, userId: string){
    const sixtyDaysInMS = 60 * 24 * 60 * 60 * 1000;
    const expAt =  new Date( Date.now() + sixtyDaysInMS);
    const [result]= await db
    .insert(refreshTokens)
    .values({
        token:token,
        userId: userId,
        expiresAt:expAt
    })
    .returning();

    return result;
}

export async function getValidRefreshTokenByToken(token:string){
    const [result] = await db
    .select()
    .from(refreshTokens)
    .where(
        and(        
            eq(refreshTokens.token, token),
            isNull(refreshTokens.revokedAt),
            gt(refreshTokens.expiresAt, new Date())
        )
    );
    return result;
}

export async function getUserFromRefreshToken(token: string){
    const [result] = await db
    .select({
        userId: refreshTokens.userId,
    })
    .from(refreshTokens)
    .where(
        and(
            eq(refreshTokens.token, token),
            isNull(refreshTokens.revokedAt),
            gt(refreshTokens.expiresAt, new Date())
        )    
    );
    return result;
}

export async function updateRevokeAtFromToken (token: string){
    const [result] = await db.update(refreshTokens).set({
        revokedAt: new Date(),
        updatedAT: new Date()
    })
    .where(
        eq(refreshTokens.token, token)
    ).returning();
    return result;

}