import pg from "pg";
import { env } from "./config.js";
import fs from "fs/promises";
import path from "path";
const { Client } = pg;

/**
 * get current data as day-month-year
 */
export function getSlug(suffix: string) {
    // Get the current date and time components
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
    const day = currentDate.getDate().toString().padStart(2, "0");
    const hours = currentDate.getHours().toString().padStart(2, "0");
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const seconds = currentDate.getSeconds().toString().padStart(2, "0");

    // Combine the date and time components with the suffix to create the slug
    return `${year}${month}${day}${hours}${minutes}${seconds}_${suffix}`;
}

export type DbConfigT = {
    type: "json" | "csv";
};

/**
 * with Singleton design pattern to only have one db pool/connection
 *
 * Singleton is a creational design pattern that lets you ensure that a class has only one instance, while providing a global access point to this instance.
 *
 * get instance with `await DB.create()`
 *
 * @url https://refactoring.guru/design-patterns/singleton
 */
export class DB {
    /**
     * @url https://www.typescript-training.com/course/fundamentals-v3/13-nullish-values/#definite-assignment-operator
     *
     * @url  https://stackoverflow.com/questions/35743426/async-constructor-functions-in-typescript
     *
     */
    private client!: pg.Client;
    private config: DbConfigT & {
        folderPath: string;
    };

    private static instance?: DB;

    private constructor(config: DbConfigT) {
        this.config = {
            ...config,
            folderPath: path.resolve(`${getSlug("DB")}`),
        };
    }

    public static async create(config: DbConfigT) {
        if (!DB.instance) {
            DB.instance = new DB(config);
            await DB.instance.dbInit();
            await fs.mkdir(DB.instance.config.folderPath);
        }

        return DB.instance;
    }

    /**
     * get client or return
     */
    private async dbInit() {
        if (this.client) return;

        const client = new Client({
            connectionString: env.db_url,
        });
        await client.connect();
        this.client = client;
        return;
    }

    async getDbTables(): Promise<{ fields: string[]; rows: string[] }> {
        const tables = await this.client.query<string[]>({
            text: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN
       ('pg_catalog', 'information_schema');
        `,
            rowMode: "array",
        });
        const rows = tables.rows.map((i) => i[0]);
        console.log(
            "🪵 discovered the following \x1b[0;32mtables\x1b[0m = ",
            rows
        );
        return {
            fields: tables.fields.map((i) => i.name),
            rows,
        };
    }

    /**
     * TODO use pg cursor https://node-postgres.com/apis/cursor
     */
    async copyTable(name: string) {
        console.log("🪵 copy table \x1b[0;32mname\x1b[0m = ", name);
        const config = {
            text: `select * from "${name}";`,
            rowMode: this.config.type === "csv" ? "array" : undefined,
        };
        const content = await this.client.query(config);

        // export to json mode
        if (config.rowMode === undefined) {
            await fs.writeFile(
                `${path.join(this.config.folderPath, `${name}.json`)}`,
                JSON.stringify(content.rows)
            );
        } else {
            throw new Error("impl csv export");
        }
    }

    async endConnection() {
        await this.client.end();
    }
}
