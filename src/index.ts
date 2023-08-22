// import { env } from "./config.js";
import { dbInit } from "./lib.js";

async function main() {
    await dbInit();
}

await main();
