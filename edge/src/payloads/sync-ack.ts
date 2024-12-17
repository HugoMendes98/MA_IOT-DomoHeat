import * as z from "zod";

/** A sync-ack simply consist of sending the date of the sync data */
export const syncAckPayloadSchema = z.object({
	date: z.coerce.date(),
	/** The one that ack-ed (mostly for debug/log) */
	id: z.string(),
});
export type SyncAckPayload = z.infer<typeof syncAckPayloadSchema>;
