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
	append: (sync: SyncEdgePayload) => {
		const loaded = STORED_DATA.read();
		STORED_DATA.write(updateRootSync(loaded, sync));
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
