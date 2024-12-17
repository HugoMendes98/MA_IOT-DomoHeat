import * as fs from "fs";

import { configurationSchema } from "./configuration.schema.js";
import { configuration } from "../config.js";
import * as path from "path";

const config = configurationSchema.parse(configuration);

const storage = path.join(config.storage, config.id);
fs.mkdirSync(storage, { recursive: true });

export const CONFIGURATION = { ...config, storage };
