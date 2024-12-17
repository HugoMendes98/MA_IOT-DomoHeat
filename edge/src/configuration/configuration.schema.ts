import * as z from "zod";

const configurationMqttSchema = z.object({
	host: z.string().default("127.0.0.1"),
	port: z.string().default("1883"),
});
export type ConfigurationMqttSchema = z.infer<typeof configurationMqttSchema>;

export const configurationSchema = z
	.object({
		/** ID for this device */
		id: z.string(),
		mode: z.enum(["cloud", "edge"]),
		/** The upper cloud (could be another edge thanks to abstraction) */
		cloud: configurationMqttSchema,
		/** Local with sensors and "children" edges (unused with cloud mode) */
		local: configurationMqttSchema,
		/** storage directory */
		storage: z.string(),
	})
	.strip();
export type Configuration = z.infer<typeof configurationSchema>;
