import { App } from "@slack/bolt";
import { messageError, splitArgs } from "../util/utils";
import { updateWhitelist } from "../util/whitelist";

const command = "/reload";

// TODO: Add permission requirements
const registerReload = (app: App) => {
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
				messageError(app, context.botToken, payload.channel_id, command, error);
			}
		}
	});
};

export default registerReload;
