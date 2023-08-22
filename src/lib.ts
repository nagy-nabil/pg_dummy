import pg from "pg";
import { env } from "./config.js";
import path from "path";
const { Client } = pg;
export async function dbInit() {
    const client = new Client({
        connectionString: env.db_url,
        ssl: true,
    });
    await client.connect();

    const res = await client.query(
        `
    SELECT relname
  FROM pg_class
 WHERE relname !~ '^(pg_|sql_)'
   AND relkind = 'r';
    `
    );

    console.log(res.rows); // Hello world!

    await client.query(`
   
    COPY "User" TO '${path.resolve()}/user.csv' DELIMITER ',' CSV HEADER;
    `);
    await client.end();
}
