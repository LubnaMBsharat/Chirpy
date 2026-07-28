import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(user:NewUser){
    const [result] = await db.insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning({
        id:users.id,
        createdAt : users.createdAt,
        updatedAt: users.updatedAt,
        email: users.email,
        isChirpyRed: users.isChirpyRed
    });
    return result;
}

export async function deleteAllUsers(){
    await db.delete(users);
}
export async function getUserByEmail(email:string){
    const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email,email));
    return result;
}

export async function updateEmailAndPassword (userId: string ,email:string, password: string){
    const [result] = await db
    .update(users)
    .set({
        email: email,
        hashedPassword :password
    })
    .where(eq(users.id, userId))
    .returning({
        id:users.id,
        createdAt : users.createdAt,
        updatedAt: users.updatedAt,
        email: users.email,
        isChirpyRed: users.isChirpyRed
    });
    return result;
}

export async function upgradeUserToChirpyRed(userId: string){
    const [result] = await db
    .update(users)
    .set({
        isChirpyRed: true,
        updatedAt: new Date()
    })
    .where(
        eq(users.id, userId)
    )
    .returning({
        id: users.id
    });
    return result;
}