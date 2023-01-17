import { App } from "@slack/bolt";
import { gammaGetActiveGroups, gammaGetUser } from "../util/gamma";
import {
	prismaCreateGroup,
	prismaCreateUser,
	prismaGetGroup,
	prismaGetSubgroups
} from "../util/prisma";
import {
	addUserToUserGroup,
	createUserGroup,
	doesUserGroupExist
} from "../util/usergroup";
import { supergroupify } from "../util/utils";
import { getWhitelist } from "../util/whitelist";

const registerOnJoinEvent = (app: App) => {
	app.event("team_join", async ({ event, client, context }) => {
		// get slack id of user that joined
		try {
			const userSlackID = event.user.id;
			const userCID = await client.users.profile
				.get({ user: userSlackID })
				.then((result) => {
					if (result.ok && result.profile && result.profile.email) {
						const email = result.profile.email;
						return email.substring(0, email.indexOf("@"));
					}
					throw new Error(`Couldn't fetch CID for user with id ${userSlackID}`);
				});
			// Adds user in the database
			prismaCreateUser(userSlackID, userCID);
			const userData = await gammaGetUser(userCID);
			const userGroups = userData.groups.map((val) => ({
				group: val.name,
				superGroup: val.superGroup?.name
			}));
			await Promise.all(
				userGroups.map(async ({ group, superGroup }) => {
					if (await doesUserGroupExist(app, group)) {
						addUserToUserGroup(app, userCID, group);
					} else if (superGroup && getWhitelist().includes(superGroup)) {
						const oldGroups = await prismaGetSubgroups(supergroupify(group));
						await Promise.all(
							oldGroups.map((oldGroup) => {
								app.client.usergroups.update({
									usergroup: oldGroup.sid,
									handle: oldGroup.name
								});
							})
						);
						const { id: sid } = await createUserGroup(app, group);
						if (!sid) throw new Error("Did not get sid for usergroup");
						await prismaCreateGroup(group, sid);
						await addUserToUserGroup(app, userCID, group);
					}
				})
			);
			// TODO: update slacks user groups if members active groups doesn't exist
			// TODO: add member to groups
		} catch (e) {
			console.log(e);
		}
	});
};

export default registerOnJoinEvent;
