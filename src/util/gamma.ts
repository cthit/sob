import { Axios } from "axios";
import { getWhitelist } from "./whitelist";

const axios = new Axios({
	baseURL: process.env.GAMMA_URL,
	timeout: 1000,
	headers: {
		name: "authorization",
		value: `pre-shared ${process.env.GAMMA_API_TOKEN}`
	}
});

export const gammaGetUser = async (cid: string) => {
	return await axios.get(`/user/${cid}`).then((result) => {
		const userData: GammaUser = result.data;
		return userData;
	});
};

const activeGroupUpdateIntervall = 604800000; // A week in milliseconds, 7 * 24 * 60 * 60 * 1000
let activeGroupLastUpdate = 0; // small number prompts an update at next get
let activeGroups: string[];

export const gammaGetActiveGroups = async () => {
	if (
		!activeGroups ||
		Date.now() - activeGroupLastUpdate > activeGroupUpdateIntervall
	)
		await updateActiveGroups();
	return [...activeGroups];
};

const updateActiveGroups = async () => {
	try {
		const filteredSuperGroups = await getSuperGroups().then((result) => {
			// Filters result after whitelist
			const whitelist = getWhitelist();
			return result.filter((val) => {
				return whitelist.includes(val.name);
			});
		});
		// Get subgroups from supergroups
		const result = filteredSuperGroups.map((val) => getSubGroups(val.name));
		activeGroups = []; // Clear current groups
		// Push new subgroups to activeGroups
		result.forEach(async (subGroupList) =>
			(await subGroupList).forEach((subGroup) => {
				activeGroups.push(subGroup.name);
			})
		);
		// Update time of update
		activeGroupLastUpdate = Date.now();
	} catch (e) {
		console.log(e);
	}
};

export const getSubGroups = async (name: string): Promise<GammaGroup[]> => {
	const result = await axios.get(`/superGroups/${name}/subgroups`);
	return result.data;
};

export const getSuperGroups = async (): Promise<GammaSuperGroup[]> => {
	const result = await axios.get("/superGroups");
	return result.data;
};

export const getGroupMembers = async (
	groupName: string
): Promise<GammaUser[]> => {
	const result = await axios.get(`/groups/${groupName}/members`);
	return result.data;
};

// Defining types like this might be a bit overkill...

type GammaUser = {
	id: string;
	cid: string;
	nick: string;
	firstName: string;
	lastName: string;
	avatarUrl?: string;
	acceptanceYear: number;
	gdpr: boolean;
	language: string;
	authorities: [string]; // TODO: Unsure if type is correct
	groups: [GammaGroup];
	websiteURLs?: string;
};

type GammaGroup = {
	id: string;
	becomesActive?: number;
	becomesInactive?: number;
	description: {
		sv: string;
		en: string;
	};
	function?: {
		sv: string;
		en: string;
	};
	email: string;
	name: string;
	prettyName: string;
	superGroup?: GammaSuperGroup;
	active?: boolean;
};

type GammaSuperGroup = {
	id: string;
	name: string;
	prettyName: string;
	type: string;
	email: string;
};
