import { App } from '@slack/bolt';
import { getAllUsers, sendMessage } from '../util/slack';
import { getCidFromEmail } from '../util/utils';
import { prismaCreateUser, prismaGetUser } from '../util/prisma';

const registerSync = (app: App) => {
	app.command('/sync', async ({ ack, payload, context }) => {
		ack();

		try {
			const allSlackUsers = await getAllUsers(app);
			// Create users in prisma
			await createAllUsers(app, allSlackUsers);
			sendMessage(app, payload.channel_id, 'Synced users');
			// Update usergroups
			await updateUsersUsergroups(app, allSlackUsers);
			sendMessage(app, payload.channel_id, 'Synced usergroups');
			// TODO: Get nonFKITUsers
			// TODO: Get deactivated users that need to be reactivated
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

const createAllUsers = async (app: App, members: { id?: string; name?: string }[]) => {
	const errors: any[] = [];
	members.forEach(async (user) => {
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

export default registerSync;
