import { App } from "@slack/bolt";
import { prismaGetUser } from "./prisma";
import { supergroupify } from "./utils";

// Fetches all groups from slack
export const getUserGroups = async (app: App) => {
	return await app.client.usergroups
		.list()
		.then((result) => {
			const userGroups = result.usergroups;
			if (userGroups !== undefined) {
				const nameList = userGroups.map((ug) => {
					return [ug.name, ug.id];
				});
				return nameList.filter((val) => {
					const [name, id] = val;
					return name !== undefined && id !== undefined;
				});
			}
		})
		.catch((e) => {
			console.log(e);
		});
};

// Group identifier can be either group slack id or the name of the group
export const doesUserGroupExist = async (app: App, groupIdentifier: string) => {
	return await getUserGroups(app)
		.then((result) => {
			if (result !== undefined) {
				result.forEach((val) => {
					const [name, id] = val;
					if (name == groupIdentifier || id == groupIdentifier) return true;
				});
				return false;
			} else {
				throw Error("No usergroups exist");
			}
		})
		.catch((e) => {
			console.log(e);
		});
};

/// Sends a request to slack to create a user group
/// returns a boolean of whether it was a success
export const createUserGroup = async (
	app: App,
	name: string,
	description?: string
) => {
	// If no description is given automatically generate one
	if (description === undefined) {
		description = name + ", en del av IT sektionen";
	}

	const baseChannels = ["allmänt", "citat", "idéer", "möten", "shitposting"];

	// format channels as slack wants it
	const channelsAsString = baseChannels
		.map((channel) => name + "-" + channel)
		.join(",");
	// send create user group request
	const response = await app.client.usergroups.create({
		name: name,
		handle: supergroupify(name), // handles must be lowercase
		channels: channelsAsString,
		description: description
	});

	if (!response.ok || !response.usergroup) {
		throw Error(
			`Could not create usergroup '${name}' with the following error: ${response.error}`
		);
	}

	return response.usergroup;
};

export const addUserToUserGroup = async (
	app: App,
	userIdentifier: string,
	group: string
) => {
	const user = await prismaGetUser(userIdentifier);
	if (!user) throw Error("User does not exist");
	const users = await app.client.usergroups.users.list();
	const response = await app.client.usergroups.users.update({
		users: user.sid,
		usergroup: group
	});

	if (!response.ok) {
		throw Error(
			`Could not add user '${userIdentifier}' to usergroup '${group}' with the following error: ${response.error}`
		);
	}
};
