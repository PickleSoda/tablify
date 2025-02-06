import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.

export const rowSchema = z.record(z.string(), z.any());

export type Row = z.infer<typeof rowSchema>;
