import * as z from "zod";
import { edgeIdentifierSchema } from "./common.js";

/** A sync-ack simply consist of sending the date of the sync data */
export const syncAckPayloadSchema = z.object({
	...edgeIdentifierSchema.shape,
	date: z.coerce.date(),
});
export type SyncAckPayload = z.infer<typeof syncAckPayloadSchema>;
