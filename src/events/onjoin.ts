import { App } from "@slack/bolt";
import { gammaGetUser } from "../util/gamma";
import {
	prismaCreateGroup,
	prismaCreateUser,
	prismaGetSubgroups
} from "../util/prisma";
import {
	addUserToUserGroup,
	createUserGroup,
	doesUserGroupExist
} from "../util/usergroup";
import { getCIdFromEmail, supergroupify } from "../util/utils";
import { getWhitelist } from "../util/whitelist";

// TODO: TEST THIS
const registerOnJoinEvent = (app: App) => {
	app.event("team_join", async ({ event, client, context }) => {
		// get slack id of user that joined
		try {
			const userSlackID = event.user.id;
			const userCID = await getCIdFromEmail(client, userSlackID);
			// Adds user in the database
			prismaCreateUser(userSlackID, userCID);
			const gammaUser = await gammaGetUser(userCID);
			// Get group name and super group name from GammaUserGroup
			const userGroups = gammaUser.groups.map((val) => ({
				groupName: val.name,
				superGroupName: val.superGroup?.name
			}));
			createAndAddUserToUserGroups(app, userGroups, userCID);
		} catch (e) {
			console.log(e);
		}
	});
};

const createAndAddUserToUserGroups = async (
	app: App,
	userGroups: { groupName: string; superGroupName?: string }[],
	userCID: string
) => {
	await Promise.all(
		userGroups.map(
			async ({ groupName: groupName, superGroupName: superGroupName }) => {
				// If user group exists, add user to that group
				if (await doesUserGroupExist(app, groupName)) {
					addUserToUserGroup(app, userCID, groupName);
					// ignore if no supergroup, create new group if super group is whitelisted
				} else if (superGroupName && getWhitelist().includes(superGroupName)) {
					// get slack ids of old groupds
					const oldGroups = await prismaGetSubgroups(supergroupify(groupName));
					await Promise.all(
						oldGroups.map((oldGroup) => {
							// change handles of old groups so new group can have it
							app.client.usergroups.update({
								usergroup: oldGroup.sid,
								handle: oldGroup.name
							});
						})
					);
					const { id: sid } = await createUserGroup(app, groupName);
					if (!sid) throw new Error("Did not get sid for usergroup");
					await prismaCreateGroup(groupName, sid);
					await addUserToUserGroup(app, userCID, groupName);
				}
			}
		)
	);
};

export default registerOnJoinEvent;
