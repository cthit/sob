import { App } from '@slack/bolt';
import { getAllUsers, sendMessage, updateMessage } from '../util/slack';
import { getCidFromEmail, getNonFKITUsers } from '../util/utils';
import { prismaCreateUser, prismaGetUser } from '../util/prisma';

const registerSync = (app: App) => {
	app.command('/sync', async ({ ack, payload, context }) => {
		ack();

		try {
			const messageResponse = await sendMessage(app, payload.channel_id, 'Started sync...');
			const allSlackUsers = await getAllUsers(app);
			// Create users in prisma
			await createAllUsers(app, allSlackUsers);
			let response = await updateMessageFromResponse(app, messageResponse, 'Synced users');
			// Update usergroups
			await updateUsersUsergroups(app, allSlackUsers);
			response = await updateMessageFromResponse(app, response, 'Synced usergroups');
			// Send message with info about users that need to be deactivated
			const nonFKITUsers = await getNonFKITUsers();
			if (nonFKITUsers.length === 0) {
				response = await updateMessageFromResponse(
					app,
					response,
					'No users need to be deactivated'
				);
			} else {
				response = await updateMessageFromResponse(
					app,
					response,
					`Users that need to be deactivated:\n${nonFKITUsers
						.map((user) => `${user.nick} ${user.cid}`)
						.join('\n')}`
				);
			}
			// Get deactivated users that need to be reactivated
			const filteredMembers = allSlackUsers
				.map((user) => {
					if (!user.id || user.deleted === undefined || !user.deleted) return;
					return user.id;
				})
				.filter((user): user is string => user !== undefined);

			const deactivated = await getDeactivatedUsers(filteredMembers);
			if (deactivated.length === 0) {
				response = await updateMessageFromResponse(
					app,
					response,
					'No users need to be reactivated'
				);
			} else {
				response = await updateMessageFromResponse(
					app,
					response,
					`Users that need to be reactivated:\n${deactivated
						.map((user) => `${user.slackId} ${user.cid}`)
						.join('\n')}`
				);
			}
		} catch (e) {
			console.log(e);
			sendMessage(
				app,
				payload.channel_id,
				`Failed to run sync command with the following error: ${e}`
			);
		}
	});
};

const updateMessageFromResponse = async (app: App, response: any, addedText: string) => {
	if (!response.ok || !response.channel || !response.ts || !response.message?.text) {
		throw new Error(`Couldn't update message`);
	}
	return await updateMessage(
		app,
		response.channel,
		response.ts,
		`${response.message.text}\n${addedText}`
	);
};

const createAllUsers = async (
	app: App,
	members: { id?: string; name?: string; deleted?: boolean }[]
) => {
	const errors: any[] = [];
	members.forEach(async (user) => {
		if (user.deleted && user.deleted === true) return;
		if (!user.id) {
			errors.push(new Error(`Couldn't find slack id for user ${user.name}`));
			return;
		}
		if (await prismaGetUser(user.id)) return;
		let cid;
		try {
			cid = await getCidFromEmail(app, user.id);
		} catch (e) {
			errors.push(e);
		}
		if (!cid) return;
		const response = await prismaCreateUser(cid, user.id);
		if (!response) errors.push(new Error(`Couldn't create user ${cid} in prisma`));
	});

	if (errors.length > 0) {
		throw errors;
	}
};

const updateUsersUsergroups = async (app: App, members: { id?: string; name?: string }[]) => {
	// TODO: Implement
};

// Returns a list of deactivated users that need to be reactivated
const getDeactivatedUsers = async (members: string[]) => {
	const result = await Promise.all(
		members.map((member) => {
			return prismaGetUser(member);
		})
	);
	return result.filter((u): u is { id: string; cid: string; slackId: string } => {
		if (!u || !u.cid) return false;
		return true;
	});
};

export default registerSync;
