import * as z from "zod";

/** The "data" returned by sensors */
export const dataSchema = z.object({
	/** Percent */
	humidity: z.number().optional(),
	/**
	 * Pa
	 * @example 98278.98
	 */
	pressure: z.number().optional(),
	/** ° Celsius */
	temperature: z.number(),
});

/** Create base identifiers schema */
function createIdentifier<const T extends string>(a: T) {
	return z.object({ id: z.string(), type: z.literal(a) });
}

// identifiers for each payload
export const sensorIdentifierSchema = createIdentifier("sensor");
export type SensorIdentifier = z.infer<typeof sensorIdentifierSchema>;
export const edgeIdentifierSchema = createIdentifier("edge");
export type EdgeIdentifier = z.infer<typeof edgeIdentifierSchema>;
