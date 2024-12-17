import * as z from "zod";
import {
	dataSchema,
	EdgeIdentifier,
	edgeIdentifierSchema,
	sensorIdentifierSchema,
} from "./common.ts";

/** The data schema with the date (set by a edge) */
const dataDatedSchema = dataSchema.extend({ date: z.coerce.date() });

/** The sync-data send by a sensor */
export const syncSensorPayloadSchema = dataSchema.extend({
	...sensorIdentifierSchema.shape,
});
export type SyncSensorPayload = z.infer<typeof syncSensorPayloadSchema>;

/** The data from a sensor (when it comes from an edge) */
export const syncSensorEdgePayloadSchema = sensorIdentifierSchema.extend({
	data: z.array(dataDatedSchema),
});
export type SyncEdgeSensorPayload = z.infer<typeof syncSensorEdgePayloadSchema>;

/** Full sync payload content */
export type SyncEdgePayload =
	| SyncEdgeSensorPayload
	| (EdgeIdentifier & {
			/** Date if sync */
			date: Date;
			nodes: Record<string, SyncEdgePayload>;
	  });
export const syncEdgePayloadSchema: z.ZodType<SyncEdgePayload> =
	z.discriminatedUnion("type", [
		syncSensorEdgePayloadSchema,
		z.object({
			/** Id of the edge */
			...edgeIdentifierSchema.shape,
			date: z.coerce.date(),
			nodes: z.record(z.lazy(() => syncEdgePayloadSchema)),
		}),
	]);
