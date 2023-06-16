import { App } from '@slack/bolt';
import { getNonFKITUsers } from '../util/utils';
import { getAdminChannelId } from '../util/config';
import { sendMessage } from '../util/slack';
import { GammaUser } from '../util/gamma';

const registerPurgeList = (app: App) => {
	app.command('/purgelist', async ({ ack, payload, context }) => {
		ack();

		try {
			const nonFKITUsers = await getNonFKITUsers();
			if (nonFKITUsers.length === 0) {
				sendMessage(app, payload.channel_id, 'No non-FKIT users found');
				return;
			}
			sendMessage(app, payload.channel_id, formatPurgeList(nonFKITUsers));
		} catch (e) {
			console.log(e);
			sendMessage(
				app,
				getAdminChannelId(),
				`Failed to run purgelist command with the following error: ${e}`
			);
		}
	});
};

const formatPurgeList = (nonFKITUsers: GammaUser[]) => {
	const formattedUsers = nonFKITUsers
		.map((user) => {
			return `${user.nick} (${user.cid})`;
		})
		.join('\n');
	return `The following users are not a part of FKIT:\n${formattedUsers}`;
};

export default registerPurgeList;
