import { App } from "@slack/bolt";
import { splitArgs } from "../util/args";
import { updateWhitelist } from "../util/whitelist";

export const registerReload = (app: App) => {
	// Example function
	app.command("/reload", async ({ ack, payload, context }) => {
		// Acknowledge the command request
		ack();

		const args = splitArgs(payload.text);

		try {
			switch (args[0]) {
				case "all":
					updateWhitelist();
					break;
				case "whitelist":
					updateWhitelist();
					break;
				default:
					throw new Error("Argument not found");
			}
		} catch (error) {
			console.error(error);
		}
	});
};
