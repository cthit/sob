import { App } from "@slack/bolt";
import { gammaGetActiveGroups, gammaGetUser } from "../util/gamma";
import { prismaGetUser } from "../util/prisma";
import { splitArgs } from "../util/utils";

const registerPurge = (app: App) => {
	app.command("/purge", async ({ ack, payload, context }) => {
		ack();

		const args = splitArgs(payload.text);

		if (args.length > 0 && args[0] == "legacy") {
			purgeLegacy(app);
		} else {
			purge();
		}
	});
};

const purge = () => {
	// iterate through user groups
	// kick members of user group if old
	// kick members with no user group
};

const purgeLegacy = async (app: App) => {
	// get all members of workspace
	const response = await app.client.admin.users.list();
	if (response && response.ok && response.users) {
		let removeCount = 0;
		response.users.map(async (user) => {
			// validate membership
			if (!user.id) {
				throw Error("Requested user doesn't have an ID?" + user);
			}
			const isValid = await hasValidMembershiop(user.id);
			if (!isValid) {
				removeCount++;
			}
		});
		console.log("Pretended to remove " + removeCount + " users");
	}
};

const hasValidMembershiop = async (slackID: string) => {
	const prismaUser = await prismaGetUser(slackID);
	if (!prismaUser)
		throw Error("Couldn't find prisma entry for Slack user: " + slackID);
	const gammaUser = await gammaGetUser(prismaUser.cid);
	gammaUser.groups.map((group) => {
		group.name;
	});
	return true;
};

export default registerPurge;
