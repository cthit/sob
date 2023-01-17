import { App } from "@slack/bolt";

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
	channels: string[],
	description?: string
) => {
	// If no description is given automatically generate one
	if (description === undefined) {
		description = name + ", en del av IT sektionen";
	}

	// format channels as slack wants it
	const channelsAsString = channels.join(",");
	// send create user group request
	const response = await app.client.usergroups.create({
		name: name,
		handle: name.toLowerCase(), // handles must be lowercase
		channels: channelsAsString,
		description: description
	});

	return response.ok;
};
