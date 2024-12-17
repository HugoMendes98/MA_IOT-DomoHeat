export class Logger {
	public constructor(public readonly prefix: string) {}

	public log(...params: unknown[]) {
		console.log(this.getPrefix(), ...params);
	}

	public error(...params: unknown[]) {
		console.error(this.getPrefix(), ...params);
	}

	private getPrefix() {
		return `[${new Date().toISOString()} - ${this.prefix}]:`;
	}
}
