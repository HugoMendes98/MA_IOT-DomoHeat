import { MqttClient } from "mqtt";
import { SetEdgePayload, SetSensorPayload } from "./payloads/index.js";
import { toMqttPayload } from "./mqtt/index.js";
import { Logger, formatCommand, formatIdentifier } from "./logger.js";

/**
 * @param client to forward the command
 * @param setPayload the received command
 * @param logger
 */
export function handleSetPayload(
	client: MqttClient,
	setPayload: SetEdgePayload,
	logger: Logger,
) {
	if (setPayload.type === "sensor") {
		const { temperature } = setPayload;
		if (temperature === undefined) {
			// Can ignore when there is nothing to set
			return;
		}

		logger.log(
			`Sending ${formatCommand("set")} to ${formatIdentifier(setPayload)} (with ${temperature}°)`,
		);
		client.publish(
			`/sensor/${setPayload.id}/set`,
			toMqttPayload<SetSensorPayload>({ temperature }),
		);
		return;
	}

	for (const setData of Object.values(setPayload.nodes)) {
		if (setData.type === "sensor") {
			// Direct sensor of an edge
			handleSetPayload(client, setData, logger);
			continue;
		}

		// Forward to their own edge
		logger.log(
			`Sending ${formatCommand("set")} to ${formatIdentifier(setData)}`,
		);
		client.publish(
			`/edge/${setData.id}/set`,
			toMqttPayload<SetEdgePayload>(setData),
		);
	}
}
