import { App, Context, SlashCommand } from "@slack/bolt";
import { respondToUrlVerification } from "@slack/bolt/dist/receivers/ExpressReceiver";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { messageError, splitArgs } from "../util/utils";
import { getUserGroups } from "../util/usergroup";

const command = "/list";

const registerList = (app: App) => {
	app.command(command, async ({ ack, payload, context }) => {
		ack();

		const args = splitArgs(payload.text);

		try {
			switch (args[0].toLowerCase()) {
				case "usergroups":
					userGroup(app, payload, context);
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

const userGroup = async (
	app: App,
	payload: SlashCommand,
	context: Context & StringIndexed
) => {
	const result = await getUserGroups(app);
	if (result !== undefined) {
		const message = result
			.map((val, i, arr) => {
				const [name, id] = val;
				return `\`\`\`Group name: ${name}\nGroup id: ${id}\`\`\``;
			})
			.join("\n");
		await app.client.chat.postMessage({
			token: context.botToken,
			channel: payload.channel_id,
			text: message
		});
	}
};

export default registerList;
