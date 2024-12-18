import { MqttClient } from "mqtt";
import { handleMqttSubscription, toMqttPayload } from "./mqtt.js";
import {
	SyncAckPayload,
	SyncEdgePayload,
	syncEdgePayloadSchema,
	SyncSensorPayload,
	syncSensorPayloadSchema,
} from "../payloads/index.js";
import { EdgeIdentifier } from "../payloads/common.js";
import { formatCommand, Logger } from "../logger.js";

/** Handlers for {@link registerToSync} */
export interface SyncHandlers {
	/** Handle a sync from a sensor */
	handleSensorSync: (topic: string, payload: SyncSensorPayload) => void;
	/** Handle a sync from an edge */
	handleEdgeSync: (topic: string, payload: SyncEdgePayload) => void;
}

/**
 * This connects with the given client and subscribe to the `sync` topics.
 * It then call the handlers with sanitized data.
 *
 * @param client The mqtt client that will connect subscribe to the sync topics
 * @param handlers to call after sanitizing
 */
export function registerToSync(client: MqttClient, handlers: SyncHandlers) {
	client.on("connect", () => {
		client.subscribe(
			[
				// Receive data from sensors
				"/sensor/+/sync",
				// Receive data from "children" edges
				"/edge/+/sync",
			],
			error => {
				if (!error) {
					return;
				}

				console.error("Could not subscribe to the 'topics'");
				process.exit(1);
			},
		);
	});

	client.on(
		"message",
		handleMqttSubscription((topic, payload) => {
			const json = JSON.parse(payload.toString()) as unknown;

			if (topic.startsWith("/sensor")) {
				handlers.handleSensorSync(
					topic,
					syncSensorPayloadSchema.parse(json),
				);
				return;
			}

			handlers.handleEdgeSync(topic, syncEdgePayloadSchema.parse(json));
		}),
	);
}

/**
 *
 * @param client to send the publish with (supposed to be the one that received the payload)
 * @param id of the sender
 * @param payload that was received
 */
export function publicSyncAck(
	client: MqttClient,
	identifier: EdgeIdentifier,
	payload: SyncEdgePayload,
	logger: Logger,
) {
	if (payload.type === "sensor") {
		// No ack for sensors
		return;
	}

	logger.log(
		`publish ${formatCommand("sync-ack")} [sync-date: ${payload.date.toISOString()}]`,
	);
	client.publish(
		`/edge/${payload.id}/sync_ack`,
		toMqttPayload<SyncAckPayload>({ ...identifier, date: payload.date }),
	);
}
