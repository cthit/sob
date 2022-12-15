import { prisma, PrismaClient } from "@prisma/client";
import { getPrismaClient } from "@prisma/client/runtime";
import { App } from "@slack/bolt";
import { createUser } from "../util/prisma";

export const registerOnJoinEvent = (app: App) => {
	app.event("team_join", async ({ event, client, context }) => {
		// get slack id of user that joined
		const userSlackID = event.user.id;
		const userMail = await client.users.profile
			.get({ user: userSlackID })
			.then((result) => {
				if (result.ok && result.profile != undefined)
					return result.profile.email;

				throw new Error(`Couldn't fetch CID for user with id ${userSlackID}`);
			})
			.catch((e) => {
				console.log(e);
			});
		if (!userMail) return;
		const userCID = userMail.substring(0, userSlackID.indexOf("@"));
		// Adds user in the database
		createUser(userSlackID, userCID);
		// TODO: Fetch data from gamma
		// TODO: update slacks user groups if members active groups doesn't exist
		// TODO: add member to groups
	});
};
