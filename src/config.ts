import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
    db_url: z.string().nonempty(),
});

export type EnvT = z.infer<typeof envSchema>;

/**
 * check for all required env vars, and return type safe process.env
 * @returns
 */
export function initENV(): EnvT {
    const parsed = envSchema.parse({
        db_url: process.env.db_url,
    });

    return parsed;
}

export const env = initENV();
