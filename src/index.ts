import express from "express";
import { middlewareErrorHandler, middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerHitsLogger} from "./admin/metrics.js";
import { handlerValidateChirp } from "./api/validate_chirp.js";

import { config } from "./config.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { handlerCreateUser } from "./api/users/createUser.js";
import { handlerReset } from "./admin/reset.js";
import { handlerCreateChirp } from "./api/chirps/createChirp.js";
import { handlerGetAllChirps } from "./api/chirps/getAllChirps.js";
import { handlerGetChirp } from "./api/chirps/getChirp.js";
import { handlerLogin } from "./api/login.js";
import { handlerRefresh } from "./api/refresh.js";
import { handlerRevoke } from "./api/revoke.js";
import { handlerUpdateUser } from "./api/users/updateUser.js";
import { handlerDeleteChirp } from "./api/chirps/deleteChirp.js";
import { handlerWebhook } from "./api/polka/webhooks.js";

// max:1 means only one connection to the db bue to security reasons
const migrationClient = postgres(config.db.dbURL,{max:1});
//this will compare the migrations we already have with the database, if there sth new it will automatically run migration
await migrate(drizzle(migrationClient),config.db.migrationConfig);

const app = express();
const PORT = 8080;

// add a Middleware app.use()
// what this Middleware does is any req came to /app directory where the static files located return the requested file and end the req
app.use("/app",middlewareMetricsInc,express.static("./src/app"));
app.use(middlewareLogResponses);
app.use(express.json());

//Readiness Endpoint (/healthz)
app.get('/api/healthz', handlerReadiness);
//app.post('/api/validate_chirp',handlerValidateChirp)
app.get('/admin/metrics',handlerHitsLogger);
app.post('/admin/reset', handlerReset);
app.post('/api/users',handlerCreateUser);
app.put('/api/users',handlerUpdateUser);
app.post('/api/login', handlerLogin);
app.post('/api/refresh', handlerRefresh);
app.post('/api/revoke', handlerRevoke);
app.post('/api/chirps',handlerCreateChirp);
app.get('/api/chirps',handlerGetAllChirps);
app.get('/api/chirps/:chirpId',handlerGetChirp);
app.delete('/api/chirps/:chirpId', handlerDeleteChirp);
app.post('/api/polka/webhooks',handlerWebhook);

//error handler middlewares
app.use(middlewareErrorHandler);

app.listen(PORT , ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
})