import { MqttClient } from "mqtt";
import { extractDateFromSync, SyncEdgePayload } from "./payloads/index.js";
import {
	publicSyncAck,
	registerEdgeListeners,
	registerToSync,
	toMqttPayload,
} from "./mqtt/index.js";
import { Logger, formatCommand, formatIdentifier } from "./logger.js";
import { STORED_DATA } from "./data.js";
import { handleSetPayload } from "./set-payload.handler.js";

export interface RunEdgeParams {
	/** Connected to the "local" broker with sensors and "children" edges */
	clientLocal: MqttClient;
	/** Connected to the a "cloud" broker with a "upper" edge or 'the cloud' */
	clientCloud: MqttClient;
}
export function runEdge(DEVICE_ID: string, params: RunEdgeParams) {
	const { clientCloud, clientLocal } = params;
	const logger = new Logger(DEVICE_ID);

	clientLocal.on("connect", () => logger.log("MQTT local connected"));
	clientCloud.on("connect", () => logger.log("MQTT cloud connected"));

	function handleSync(payload: SyncEdgePayload) {
		const date = extractDateFromSync(payload);
		logger.log(
			`Received ${formatCommand("sync")} from ${formatIdentifier(payload)} [sync-date: ${date.toISOString()}]`,
		);

		const stored = STORED_DATA.append(payload);
		publicSyncAck(
			clientLocal,
			{ id: DEVICE_ID, type: "edge" },
			payload,
			logger,
		);

		// Forward data
		// TODO: that would probably be better if the data is published in a second time
		logger.log(
			`publish ${formatCommand("sync")} [sync-date: ${stored.date.toISOString()}]`,
		);
		clientCloud.publish(`/edge/${DEVICE_ID}/sync`, toMqttPayload(stored));
	}
	registerToSync(clientLocal, {
		handleEdgeSync: (_, payload) => handleSync(payload),
		handleSensorSync: (_, payload) =>
			handleSync({
				id: payload.id,
				type: "sensor",
				data: [{ ...payload, date: new Date() }],
			}),
	});

	registerEdgeListeners(DEVICE_ID, clientCloud, {
		handleSet: (_, payload) =>
			handleSetPayload(clientLocal, payload, logger),
		handleSyncAck(_, payload) {
			logger.log(
				`Received ${formatCommand("sync-ack")} from ${formatIdentifier(payload)} [sync-date: ${payload.date.toISOString()}]`,
			);

			// TODO: should check the date before cleaning
			STORED_DATA.empty();
		},
	});
}
