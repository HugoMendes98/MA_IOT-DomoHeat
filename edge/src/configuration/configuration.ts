import { configurationSchema } from "./configuration.schema.js";
import { configuration } from "../config.js";

export const CONFIGURATION = configurationSchema.parse(configuration);
