import * as fs from "fs";

import { SyncEdgeEdgePayload, SyncEdgePayload } from "./payloads/sync.js";
import path from "path";
import { CONFIGURATION } from "./configuration/configuration.js";
import { updateRootSync } from "./sync-update.js";

export const STORED_DATA = {
	getPath: () => path.join(CONFIGURATION.storage, "data.json"),

	read: (): SyncEdgeEdgePayload => {
		const pathData = STORED_DATA.getPath();

		if (!fs.existsSync(pathData)) {
			STORED_DATA.empty();
		}

		return JSON.parse(
			fs.readFileSync(pathData).toString(),
		) as SyncEdgeEdgePayload;
	},
	/**
	 * Add new data
	 * @param sync to add/update
	 * @returns the updated data
	 */
	append: (sync: SyncEdgePayload) => {
		const loaded = STORED_DATA.read();
		const updated = updateRootSync(loaded, sync);

		STORED_DATA.write(updated);
		return updated;
	},
	empty: () => {
		STORED_DATA.write({
			date: new Date(),
			id: CONFIGURATION.id,
			nodes: {},
			type: "edge",
		});
	},
	write: (data: SyncEdgeEdgePayload) => {
		const pathData = STORED_DATA.getPath();
		fs.writeFileSync(
			pathData,
			JSON.stringify(data, null, process.env["JSON_PRETTY"] ? 2 : 4),
		);
	},
};
