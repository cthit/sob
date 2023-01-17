import { App } from "@slack/bolt";
import { messageError, splitArgs } from "../util/utils";
import { getWhitelist } from "../util/whitelist";

const command = "/update";

const registerUpdate = (app: App) => {
	// Example function
	app.command(command, async ({ ack, payload, context }) => {
		// Acknowledge the command request
		ack();

		const args = splitArgs(payload.text);

		try {
			switch (args[0]) {
				case "all":
					updateUserGroups();
					break;
				case "usergroups":
					updateUserGroups();
					break;
				default:
			}
		} catch (error) {
			if (error instanceof Error) {
				messageError(app, context.botToken, payload.channel_id, command, error);
			}
		}
	});
};

const updateUserGroups = () => {
	const whitelist = getWhitelist();
	whitelist.forEach((e) => {});
};

export default registerUpdate;
