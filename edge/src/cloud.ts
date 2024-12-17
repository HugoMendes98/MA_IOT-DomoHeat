import { MqttClient } from "mqtt";

import { publicSyncAck, registerToSync } from "./mqtt/index.js";
import { Logger } from "./logger.js";
import { SyncEdgePayload } from "./payloads/sync.js";
import { STORED_DATA } from "./data.js";

export interface RunCloudParams {
	/** Connected to the "cloud" broker with "children" edges */
	client: MqttClient;
}
export function runCloud(DEVICE_ID: string, params: RunCloudParams) {
	const { client } = params;
	const logger = new Logger(DEVICE_ID);

	client.on("connect", () => logger.log("MQTT connected"));

	function handleSyncEdge(payload: SyncEdgePayload) {
		STORED_DATA.append(payload);
		publicSyncAck(client, DEVICE_ID, payload);
	}

	registerToSync(client, {
		handleEdgeSync: (_, payload) => handleSyncEdge(payload),
		handleSensorSync: (_, payload) =>
			handleSyncEdge({
				id: payload.id,
				type: "sensor",
				data: [{ ...payload, date: new Date() }],
			}),
	});
}
