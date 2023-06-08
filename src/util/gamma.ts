import { Axios } from 'axios';

const axios = new Axios({
	baseURL: process.env.GAMMA_URL,
	timeout: 1000,
	headers: {
		name: 'authorization',
		value: `pre-shared ${process.env.GAMMA_API_TOKEN}`
	}
});

export const isFKIT = (group: GammaSuperGroup) => {
	return (
		group.type === 'COMMITTEE' ||
		group.type === 'SOCIETY' ||
		group.type === 'BOARD' ||
		group.type === 'FUNCTIONARIES'
	);
};

export const gammaGetUser = async (cid: string) => {
	return await axios.get(`/user/${cid}`).then((result) => {
		const userData: GammaUser = result.data;
		return userData;
	});
};

export const filterActiveGammaGroups = (gammaGroups: [GammaGroup]) => {
	return gammaGroups.filter((g) => {
		if (g.superGroup) {
			return isFKIT(g.superGroup);
		}
		return false;
	});
};

export const getSubGroups = async (name: string): Promise<GammaGroup[]> => {
	const result = await axios.get(`/superGroups/${name}/subgroups`);
	return result.data;
};

export const getSuperGroups = async (): Promise<GammaSuperGroup[]> => {
	const result = await axios.get('/superGroups');
	return result.data;
};

export const getGroupMembers = async (groupName: string): Promise<GammaUser[]> => {
	const result = await axios.get(`/groups/${groupName}/members`);
	return result.data;
};

// Defining types like this might be a bit overkill...

export type Authority = {
	id: string;
	aothority: string;
};

export type GammaUser = {
	id: string;
	cid: string;
	nick: string;
	firstName: string;
	lastName: string;
	avatarUrl?: string;
	acceptanceYear: number;
	gdpr: boolean;
	language: string;
	authorities: [Authority];
	groups: [GammaGroup];
	websiteURLs?: string;
};

export type GammaGroup = {
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

export type GammaSuperGroup = {
	id: string;
	name: string;
	prettyName: string;
	type: string;
	email: string;
};
