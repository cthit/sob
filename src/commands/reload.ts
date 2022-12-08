import { App } from "@slack/bolt";
import { splitArgs } from "../util/util";
import { updateWhitelist } from "../util/whitelist";

const command = "/reload";

// TODO: Add permission requirements
export const registerReload = (app: App) => {
	// Example function
	app.command(command, async ({ ack, payload, context }) => {
		// Acknowledge the command request
		ack();

		const args = splitArgs(payload.text);

		try {
			switch (args[0]) {
				case "help":
					await app.client.chat.postMessage({
						token: context.botToken,
						channel: payload.channel_id,
						text: 'Available arguments "/help" are:\nall - Reloads all configs\nwhitelist - Reloads gamma group whitelist'
					});
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
			if (error instanceof Error) {
				const message = `Could not execute the command "${command}": ${error.message}`;
				await app.client.chat.postMessage({
					token: context.botToken,
					channel: payload.channel_id,
					text: message
				});
			}
		}
	});
};
