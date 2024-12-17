import * as mqtt from "mqtt";

import "./edge.ts";
import { CONFIGURATION } from "./configuration/configuration.js";
import { runCloud } from "./cloud.js";
import { runEdge } from "./edge.js";
import { ConfigurationMqttSchema } from "./configuration/configuration.schema.js";

function createMqttClient(config: ConfigurationMqttSchema) {
	const { host, port } = config;
	return mqtt.connect(`mqtt://${host}:${port}`);
}

// Bootstrap
(() => {
	const { cloud, id, local, mode } = CONFIGURATION;

	const clientCloud = createMqttClient(cloud);

	// On a real project, these 2 modes would have different build configuration
	if (mode === "cloud") {
		runCloud(id, { client: clientCloud });
	}
	if (mode === "edge") {
		const clientLocal = createMqttClient(local);
		runEdge(id, { clientCloud, clientLocal });
	}
})();
