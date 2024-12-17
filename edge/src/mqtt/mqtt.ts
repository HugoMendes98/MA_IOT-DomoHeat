import * as mqtt from "mqtt";

/**
 * Handles Mqtt topic subscription by wrapping the callback on a try-catch.
 * this avoid to kill the program on a undesired error
 */
export function handleMqttSubscription(
	fn: mqtt.OnMessageCallback,
): mqtt.OnMessageCallback {
	return (...params) => {
		try {
			fn(...params);
		} catch (error: unknown) {
			console.error(
				`Caught the following error on the subscription of '${params[0]}':`,
				error,
			);
		}
	};
}

export function toMqttPayload<T>(payload: T) {
	return JSON.stringify(payload);
}
