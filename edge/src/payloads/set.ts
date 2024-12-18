import * as z from "zod";
import {
	dataSchema,
	EdgeIdentifier,
	edgeIdentifierSchema,
	sensorIdentifierSchema,
} from "./common.js";

/** Data send directly to a sensor to control it */
export const setSensorPayloadSchema = dataSchema
	.pick({ temperature: true })
	.partial();
export type SetSensorPayload = z.infer<typeof setSensorPayloadSchema>;

/** The set-data for a sensor (when it comes from an edge) */
export const setEdgeSensorPayloadSchema = setSensorPayloadSchema.extend(
	sensorIdentifierSchema.shape,
);
export type SetEdgeSensorPayload = z.infer<typeof setEdgeSensorPayloadSchema>;

/** Full set payload content */
export type SetEdgePayload =
	| SetEdgeSensorPayload
	| (EdgeIdentifier & { nodes: Record<string, SetEdgePayload> });
export const setEdgePayloadSchema: z.ZodType<SetEdgePayload> =
	z.discriminatedUnion("type", [
		setEdgeSensorPayloadSchema,
		z.object({
			...edgeIdentifierSchema.shape,
			nodes: z.record(z.lazy(() => setEdgePayloadSchema)),
		}),
	]);
