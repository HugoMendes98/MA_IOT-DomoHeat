import {
	SyncEdgeEdgePayload,
	SyncEdgePayload,
	SyncEdgeSensorPayload,
	SyncNodes,
} from "./payloads";

/**
 * @param base the currently stored data
 * @param sync the new data
 * @returns result of the merge
 */
function mergeEdgeSync(
	base: SyncEdgeEdgePayload,
	sync: SyncEdgeEdgePayload,
): SyncEdgeEdgePayload {
	const nodes = Object.values(sync.nodes).reduce(
		// Iterate on the received nodes to merge with the current one
		(nodes, syncPayload) => mergeNodeSync(nodes, syncPayload),
		base.nodes,
	);

	return { ...sync, nodes };
}

/**
 * @param base the currently stored data
 * @param sync the new data
 * @returns result of the merge
 */
function mergeSensorSync(
	base: SyncEdgeSensorPayload,
	sync: SyncEdgeSensorPayload,
): SyncEdgeSensorPayload {
	// Add the new sensor data
	return { ...sync, data: [...sync.data, ...base.data] };
}

/**
 * @param base the currently stored data
 * @param sync the new data
 * @returns result of the merge
 */
function mergeSync(
	base: SyncEdgePayload,
	sync: SyncEdgePayload,
): SyncEdgePayload {
	if (base.type === "edge" && base.type === sync.type) {
		return mergeEdgeSync(base, sync);
	}

	if (base.type === "sensor" && base.type === sync.type) {
		return mergeSensorSync(base, sync);
	}

	console.debug("A node changed its type, overwrite", base, sync);
	return sync;
}

function mergeNodeSync(nodes: SyncNodes, sync: SyncEdgePayload): SyncNodes {
	const node = nodes[sync.id];

	return {
		...nodes,
		[sync.id]: node
			? // Merge the existing with the update
				mergeSync(node, sync)
			: // New node => simply add it
				sync,
	};
}

/**
 * Update a root/base edge sync with new data.
 * It also update the data of the root
 *
 * @param base the currently stored data
 * @param sync the new data to add
 * @returns result of the merge
 */
export function updateRootSync(
	base: SyncEdgeEdgePayload,
	sync: SyncEdgePayload,
): SyncEdgeEdgePayload {
	return {
		...base,
		date: new Date(),
		nodes: mergeNodeSync(base.nodes, sync),
	};
}
