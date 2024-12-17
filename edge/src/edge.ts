import { MqttClient } from "mqtt";
import {
	SetEdgePayload,
	SetSensorPayload,
	SyncEdgePayload,
} from "./payloads/index.js";
import {
	publicSyncAck,
	registerEdgeListeners,
	registerToSync,
} from "./mqtt/index.js";
import { Logger } from "./logger.js";

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
	clientLocal.on("connect", () => logger.log("MQTT cloud connected"));

	registerToSync(clientLocal, {
		handleEdgeSync(topic, payload) {
			// TODO: store and send in a 2nd time

			clientCloud.publish(
				`/edge/${DEVICE_ID}/sync`,
				JSON.stringify({
					id: DEVICE_ID,
					type: "edge",
					date: new Date(),

					nodes: { [payload.id]: payload },
				} satisfies SyncEdgePayload),
			);

			publicSyncAck(clientLocal, DEVICE_ID, payload);
		},
		handleSensorSync(topic, payload) {
			// TODO: store and send in a 2nd time
			clientCloud.publish(
				`/edge/${DEVICE_ID}/sync`,
				JSON.stringify({
					id: DEVICE_ID,
					type: "edge",
					date: new Date(),

					nodes: {
						[payload.id]: {
							id: payload.id,
							type: "sensor",

							data: [{ ...payload, date: new Date() }],
						},
					},
				} satisfies SyncEdgePayload),
			);
		},
	});

	function handleSets(setPayload: SetEdgePayload) {
		if (setPayload.type === "sensor") {
			if (setPayload.temperature === undefined) {
				return;
			}

			clientLocal.publish(
				`/sensor/${setPayload.id}/set`,
				JSON.stringify({
					temperature: setPayload.temperature,
				} satisfies SetSensorPayload),
			);

			return;
		}

		for (const [_, setData] of Object.entries(setPayload.nodes)) {
			if (setData.type === "sensor") {
				// Direct sensor of this edge
				handleSets(setData);
				continue;
			}

			// Forward to their own edge
			clientLocal.publish(
				`/edge/${setData.id}/set`,
				JSON.stringify(setData satisfies SetEdgePayload),
			);
		}
	}
	registerEdgeListeners(DEVICE_ID, clientCloud, {
		handleSet(topic, payload) {
			handleSets(payload);
		},
		handleSyncAck(topic, payload) {
			console.log("Received an ack", payload);
		},
	});
}
