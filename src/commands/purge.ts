import { App } from '@slack/bolt';
import { sendMessage } from '../util/slack';
import { getAdminChannelId, isWhitelisted } from '../util/config';
import {
	prismaGetAllGroups,
	prismaGetAllUsers,
	prismaGetGroup,
	prismaGetUser
} from '../util/prisma';
import { gammaGetUser, isFKIT } from '../util/gamma';

// Probably impossible to automate entirely as it might requires enterprise...
const registerPurge = (app: App) => {
	app.command('/purge', async ({ ack, payload, context }) => {
		ack();

		try {
			// Get alla users in database
			const users = await prismaGetAllUsers();
			// Get their data from gamma
			const gammaUsers = await Promise.all(users.map((user) => gammaGetUser(user.cid)));
			// Filter out users that are active
			const nonFKITUsers = gammaUsers.filter((user) => isWhitelisted(user));
			// Fetch slackIds for nonFKITUsers
			const nonFKITUsersSlackIds = await Promise.all(
				nonFKITUsers.map((user) => prismaGetUser(user.cid))
			);
			// Remove users from the workspace
			const response = await Promise.all(
				nonFKITUsersSlackIds.map((user) => {
					if (!user || !user.slackId) {
						throw new Error(`Couldn't find slack id for user ${user?.cid}`);
					}
					// Might be worth to try session.reset() instead
					return app.client.admin.users.remove({
						team_id: payload.team_id,
						token: context.botToken,
						user_id: user.slackId
					});
				})
			);
		} catch (e) {
			console.log(e);
			sendMessage(
				app,
				getAdminChannelId(),
				`Failed to run purge command with the following error: ${e}`
			);
		}
	});
};

export default registerPurge;
