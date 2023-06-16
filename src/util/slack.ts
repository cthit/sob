import { App } from '@slack/bolt';
import { getDefaultChannels } from './config';

// Sends a message to a channel
export const sendMessage = async (app: App, channelId: string, message: string) => {
	return await app.client.chat.postMessage({
		token: process.env.SLACK_BOT_TOKEN,
		// Channel to send message to
		channel: channelId,
		// Text in the notification
		text: message
	});
};

// Updates a message
export const updateMessage = async (
	app: App,
	channelId: string,
	ts: string,
	newMessage: string
) => {
	return await app.client.chat.update({
		token: process.env.SLACK_BOT_TOKEN,
		channel: channelId,
		ts: ts,
		text: newMessage
	});
};

// Creates a channel
export const createChannel = async (app: App, name: string, isPrivate: boolean) => {
	return await app.client.conversations.create({
		name: name.toLocaleLowerCase().trim(),
		is_private: isPrivate
	});
};

// Creates default channels from config
export const createDefaultChannels = async (app: App, baseName: string) => {
	// Get default channel names
	const defaultChannels = getDefaultChannels(baseName);
	// Create channels
	const channelResponses = await Promise.all(
		defaultChannels.map(async (channel) => {
			return await createChannel(app, channel, true);
		})
	);
	// maybe return the responses instead?
	const channelIds = channelResponses.map((channelResponse) => {
		if (!channelResponse.channel || !channelResponse.channel.id) {
			throw new Error('Could not create channel');
		}
		return channelResponse.channel.id;
	});
	return channelIds;
};

/// Sends a request to slack to create a user group
export const createUserGroup = async (
	app: App,
	name: string,
	handle: string,
	channelIds?: string[],
	description?: string
) => {
	if (!channelIds) {
		return await app.client.usergroups.create({
			name: name,
			handle: handle, // handles must be lowercase
			description: description
		});
	}

	return await app.client.usergroups.create({
		name: name,
		handle: name, // handles must be lowercase
		channels: channelIds.join(','), // channels must be comma separated
		description: description
	});
};

// Creates a user group and adds default channels to it
export const createAndInitUserGroup = async (
	app: App,
	name: string,
	handle: string,
	description?: string
) => {
	const channelIds = await Promise.all(await createDefaultChannels(app, name));
	if (!description) {
		description = name + ', en del av IT sektionen';
	}
	return await createUserGroup(app, name, handle, channelIds, description);
};

// Adds a user to a user group
export const addUserToUserGroup = async (app: App, userSlackId: string, groupSlackId: string) => {
	// Silly way to do it, but thats how the slack api works
	// Get current users in usergroup
	const users = await app.client.usergroups.users.list();
	if (!users.ok || !users.users) {
		throw Error(
			`Could not get users in usergroup '${groupSlackId}' with the following error: ${users.error}`
		);
	}
	// Send updated list of users to slack
	return await app.client.usergroups.users.update({
		users: `${users.users},${userSlackId}`,
		usergroup: groupSlackId
	});
};

export const getAllUsers = async (app: App) => {
	const result = await getPageOfUsers(app);

	const allMembers = result.members;
	let cursor = result.newCursor;

	while (cursor && cursor !== '') {
		const { members, newCursor } = await getPageOfUsers(app, cursor);
		allMembers.push(...members);
		cursor = newCursor;
	}

	return allMembers;
};

const getPageOfUsers = async (app: App, cursor?: string, limit = 200) => {
	const response = await app.client.users.list({
		limit,
		cursor
	});

	if (!response.ok || !response.members) {
		throw new Error(`Could not get users in workspace with the following error: ${response.error}`);
	}

	const members = response.members;
	let newCursor;

	if (response.response_metadata?.next_cursor) {
		newCursor = response.response_metadata.next_cursor;
	}

	return { members, newCursor };
};
