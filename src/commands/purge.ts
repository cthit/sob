import { App } from '@slack/bolt';
import { sendMessage } from '../util/slack';
import { getAdminChannelId, isWhitelisted } from '../util/config';
import { prismaGetUser } from '../util/prisma';
import { getNonFKITUsers } from '../util/utils';

// Probably impossible to automate entirely as it might requires an enterprise subscription...
// The other option is to make it send a list of users to remove and then have an admin remove them manually
const registerPurge = (app: App) => {
	app.command('/purge', async ({ ack, payload, context }) => {
		ack();

		try {
			// Fetch slackIds for nonFKITUsers
			const nonFKITUsersSlackIds = await Promise.all(
				(await getNonFKITUsers()).map((user) => prismaGetUser(user.cid))
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
