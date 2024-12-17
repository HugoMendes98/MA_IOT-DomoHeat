import * as z from "zod";
import { configurationSchema } from "./configuration/configuration.schema.ts";

// Copy to `config.ts`

export const configuration: z.input<typeof configurationSchema> = {
	id: process.env["DEVICE_ID"] || "edge",
	mode: process.env["DEVICE_CLOUD"] === "true" ? "cloud" : "edge",
	cloud: {
		host: process.env["MQTT_CLOUD_HOST"],
		port: process.env["MQTT_CLOUD_PORT"],
	},
	local: {
		host: process.env["MQTT_LOCAL_HOST"],
		port: process.env["MQTT_LOCAL_PORT"],
	},
};
