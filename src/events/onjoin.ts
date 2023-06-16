import { App } from '@slack/bolt';
import { GammaGroup, filterActiveGammaGroups, gammaGetUser } from '../util/gamma';
import { prismaCreateUser, prismaGetGroup } from '../util/prisma';
import {
	createGlobalUserGroup,
	getCidFromEmail,
	makeHandleAvailable,
	supergroupify
} from '../util/utils';
import { getAdminChannelId } from '../util/config';
import { addUserToUserGroup, createDefaultChannels, sendMessage } from '../util/slack';

// TODO: TEST THIS
// TODO: Better error handling
const registerOnJoinEvent = (app: App) => {
	app.event('team_join', async ({ event, client, context }) => {
		try {
			// get slack id of user that joined
			const userSlackID = event.user.id;
			const userCID = await getCidFromEmail(app, userSlackID);
			// Adds user in the database
			prismaCreateUser(userSlackID, userCID);
			const gammaUser = await gammaGetUser(userCID);
			// Send welcome message
			sendWelcomeMessage(app, event.user.id, gammaUser.nick);
			// Filter to only active gamma groups
			const filteredGroups = filterActiveGammaGroups(gammaUser.groups);
			// Create missing user groups
			await createMissingUserGroups(app, filteredGroups);
			// Get slackId of user groups throwing an error if none is found
			const userGroupSlackIds = await Promise.all(
				filteredGroups.map((group) => prismaGetGroup(group.name))
			).then((result) => {
				return result.map((group) => {
					if (!group || !group.slackId) {
						throw new Error(`Couldn't find slack id for group ${group?.gammaName}`);
					}
					return group.slackId;
				});
			});
			// Add user to user groups
			const response = await Promise.all(
				userGroupSlackIds.map((slackGroupId) => addUserToUserGroup(app, userSlackID, slackGroupId))
			);
			if (response.some((res) => !res.ok)) {
				throw new Error(`Failed to add user ${userSlackID} to usergroups`);
			}
		} catch (e) {
			console.log(e);
			sendMessage(
				app,
				getAdminChannelId(),
				`Failed to run onjoin event for user ${event.user.id} with the following error: ${e}`
			);
		}
	});
};

const createMissingUserGroups = async (app: App, gammaGroups: GammaGroup[]) => {
	// Filters out already existing groups
	const groups = await Promise.all(
		gammaGroups.filter((group) => {
			return !prismaGetGroup(group.name);
		})
	);
	// Creates user groups
	const response = await Promise.all(
		groups.map(async (group) => {
			// Create the handle
			const handle = supergroupify(group.name);
			// Make sure the handle is available
			await makeHandleAvailable(app, handle);
			// Create the user group
			return createGlobalUserGroup(
				app,
				group.prettyName,
				group.name,
				group.name,
				await createDefaultChannels(app, group.name)
			);
		})
	);
};

const sendWelcomeMessage = (app: App, userSlackID: string, name: string) => {
	sendMessage(
		app,
		userSlackID,
		`Hejsan ${name} och välkommen till FKIT-slacken! :wave:
		Är det första gången du använder slack eller om du vill lära dig mer  rekommenderar jag att du läser här.
		I FKIT-slacken hittar du följande kanaler:
		- #fkit-allmänt för frågor eller annat som rör hela FKIT
		- #fkit-info där man kan skicka ut och läsa viktig information
		- #fkit-citat där hittar man dumma och roliga saker folk har sagt
		- #fkit-memes är bra för att dela med dig av något roligt du hittat eller skapat`
	);
};

export default registerOnJoinEvent;
