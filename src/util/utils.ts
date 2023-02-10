import { App } from "@slack/bolt";
import { WebClient } from "@slack/web-api";

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

/// Makes a subgroup have it's supergroups name
export const supergroupify = (groupName: string) => {
	return groupName
		.toLowerCase()
		.trim()
		.substring(0, groupName.length - 3);
};

export const getCIdFromEmail = async (
	client: WebClient,
	userSlackID: string
) => {
	return await client.users.profile
		.get({ user: userSlackID })
		.then((result) => {
			if (result.ok && result.profile && result.profile.email) {
				const email = result.profile.email;
				return email.substring(0, email.indexOf("@"));
			}
			throw new Error(`Couldn't fetch CID for user with id ${userSlackID}`);
		});
};
