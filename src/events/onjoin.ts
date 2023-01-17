import { App } from "@slack/bolt";
import { gammaGetActiveGroups, gammaGetUser } from "../util/gamma";
import { prismaCreateUser } from "../util/prisma";

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
			// TODO: Fetch data from gamma
			const userData = await gammaGetUser(userCID);
			const userGroups = userData.groups.map((val) => val.name);
			userGroups.forEach((group) => {});
			// TODO: update slacks user groups if members active groups doesn't exist
			// TODO: add member to groups
		} catch (e) {
			console.log(e);
		}
	});
};

export default registerOnJoinEvent;
