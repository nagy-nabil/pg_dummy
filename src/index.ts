// import { env } from "./config.js";
import { DB } from "./lib.js";

async function main() {
    const db = await DB.create({
        type: "json",
    });
    const tables = await db.getDbTables();
    for (const table of tables.rows) {
        await db.copyTable(table);
    }
    await db.endConnection();
}

await main();
