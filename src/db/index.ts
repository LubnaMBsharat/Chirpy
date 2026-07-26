import {drizzle} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../config.js";
import * as schema from "./schema.js";

const conn = postgres(config.db.dbURL);
export const db = drizzle(conn,{schema});