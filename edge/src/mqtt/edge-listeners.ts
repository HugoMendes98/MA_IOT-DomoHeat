import { MqttClient } from "mqtt";
import { handleMqttSubscription } from "./mqtt.js";
import {
	SetEdgePayload,
	setEdgePayloadSchema,
	SyncAckPayload,
	syncAckPayloadSchema,
} from "../payloads/index.js";

/** Handlers for {@link registerEdgeListeners} */
export interface EdgeListenersHandlers {
	/** Handle a 'set' from another "upper edge" */
	handleSet: (topic: string, payload: SetEdgePayload) => void;
	/** Handle the ack of a sync */
	handleSyncAck: (topic: string, payload: SyncAckPayload) => void;
}

/**
 * This connects with the given client and subscribe to the `listeners` topics.
 * It is when a client in the broker directly "contacts" the given DEVICE_ID
 *
 * @param DEVICE_ID the device of the client that listen to the topis
 */
export function registerEdgeListeners(
	DEVICE_ID: string,
	client: MqttClient,
	handlers: EdgeListenersHandlers,
) {
	client.on("connect", () => {
		client.subscribe(
			[
				// Receive acknowledge of sync from "upper" edge/cloud (eg. the cloud has received the data)
				`/edge/${DEVICE_ID}/sync_ack`,
				// Received command from cloud
				`/edge/${DEVICE_ID}/set`,
			],
			error => {
				if (!error) {
					return;
				}

				console.error("Could not subscribe to the 'topics'");
			},
		);
	});

	client.on(
		"message",
		handleMqttSubscription((topic, payload) => {
			const json = JSON.parse(payload.toString()) as unknown;

			if (topic.endsWith("/set")) {
				handlers.handleSet(topic, setEdgePayloadSchema.parse(json));
				return;
			}

			handlers.handleSyncAck(topic, syncAckPayloadSchema.parse(json));
		}),
	);
}
