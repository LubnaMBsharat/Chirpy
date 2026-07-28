// this file will hold any stateful, in-memory data we'll need to keep track of

import { MigrationConfig } from "drizzle-orm/migrator";

//to load the environment variables in our .env file.
process.loadEnvFile();
export function envOrThrow(key: string){
    const value = process.env[key];
    if(! value){
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

type DBConfig= {
    dbURL: string;
    migrationConfig: MigrationConfig;
}
type APIConfig = {
    fileserverHits: number;
    jwtSecret: string;
    polkaKey: string;
}
type Config = {
    api : APIConfig;
    db: DBConfig;
}

//MigrationConfig object that stores the path to my migrations, we will use it for automatic migrations
const migrationConfig: MigrationConfig ={ 
    migrationsFolder: "./migrations"
}

const apiConfig : APIConfig = {
    fileserverHits : 0,
    jwtSecret: envOrThrow("SECRET"),
    polkaKey: envOrThrow("POLKA_KEY")
}

const dbConfig : DBConfig = {
    dbURL : envOrThrow("DB_URL"),
    migrationConfig: migrationConfig,
}

export const config : Config = {
    api: apiConfig,
    db : dbConfig,
}