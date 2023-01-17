import { App } from "@slack/bolt";

export const splitArgs = (args: string) => args.trim().split(" ");

export const messageError = async (
	app: App,
	botToken: string | undefined,
	channel_id: string,
	command: string,
	error: Error
) => {
	const message = `Could not execute "${command}": ${error.message}`;
	await app.client.chat.postMessage({
		token: botToken,
		channel: channel_id,
		text: message
	});
};

export const supergroupify = (group: string) => {
	return group
		.toLowerCase()
		.trim()
		.substring(0, group.length - 3);
};
