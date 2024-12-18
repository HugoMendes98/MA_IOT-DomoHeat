import chalk from "chalk";
import { EdgeIdentifier, SensorIdentifier } from "./payloads/common";

export function formatCommand(command: string) {
	return chalk.green(command);
}
export function formatIdentifier(
	identifier: EdgeIdentifier | SensorIdentifier,
) {
	const { id, type } = identifier;
	return chalk.cyan(`${type}/${id}`);
}

export class Logger {
	public constructor(public readonly prefix: string) {}

	public log(...params: unknown[]) {
		console.log(chalk.black(this.getPrefix(), ...params));
	}

	public error(...params: unknown[]) {
		console.error(chalk.red(this.getPrefix(), ...params));
	}

	private getPrefix() {
		return chalk.blue(
			`[${new Date().toISOString()} - ${chalk.yellow(this.prefix)}]:`,
		);
	}
}
