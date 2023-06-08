import { App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { createUserGroup } from './slack';
import { prismaCreateGroup, prismaGetGroup, prismaUpdateGroupHandle } from './prisma';

export const splitArgs = (args: string) => args.trim().split(' ');

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

export const getCidFromEmail = async (client: WebClient, userSlackID: string) => {
	return await client.users.profile.get({ user: userSlackID }).then((result) => {
		if (result.ok && result.profile && result.profile.email) {
			const email = result.profile.email;
			return email.substring(0, email.indexOf('@'));
		}
		throw new Error(`Couldn't fetch CID for user with id ${userSlackID}`);
	});
};

// Creates a slack usergroup and a prisma usergroup
// returns the slack id of the usergroup
export const createGlobalUserGroup = async (
	app: App,
	prettyName: string,
	gammaName: string,
	handle: string,
	channelIds?: string[],
	description?: string
) => {
	const slackResponse = await createUserGroup(app, prettyName, handle, channelIds, description);
	if (!slackResponse.ok || !slackResponse.usergroup || !slackResponse.usergroup.id) {
		throw new Error(
			`Couldn't create usergroup ${gammaName} with the following error: ${slackResponse.error}`
		);
	}
	const prismaResponse = await prismaCreateGroup(handle, slackResponse.usergroup.id, gammaName);
	if (!prismaResponse) {
		throw new Error(`Couldn't create usergroup ${gammaName} in prisma`);
	}
	return slackResponse.usergroup.id;
};

// Makes sure that no user groups has specified handle
export const makeHandleAvailable = async (app: App, handle: string) => {
	const response = await prismaGetGroup(handle);
	if (!response) {
		return;
	}
	// If there is a usergroup with the handle, change to gammaName
	const slackResponse = await app.client.usergroups.update({
		handle: response.gammaName,
		usergroup: response.slackId
	});
	if (!slackResponse.ok) {
		throw new Error(
			`Couldn't update usergroup ${response.gammaName} with the following error: ${slackResponse.error}`
		);
	}
	prismaUpdateGroupHandle(handle, response.gammaName);
};
