import * as fs from 'fs';
import { GammaUser, isFKIT } from './gamma';

interface Config {
	adminChannelId: string;
	defaultChannels: string[];
	whitelist: {
		groups: string[];
		individuals: string[];
	};
}

let config: Config;

export const initConfig = () => {
	// If file doesn't exist, create it
	if (!fs.existsSync('config.json')) {
		fs.writeFileSync(
			'config.json',
			JSON.stringify({
				adminChannelId: 'Fill in admin channel id',
				defaultChannels: ['allmänt', 'citat', 'idéer', 'möten', 'shitposting'],
				whitelist: {
					groups: [],
					individuals: []
				}
			})
		);
	}
	// Read config file
	if (!config) {
		updateConfig();
	}
};

const updateConfig = () => {
	config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
};

const addToConfig = (func: (value: string) => any, value: string) => {
	updateConfig();
	func(value);
	fs.writeFileSync('config.json', JSON.stringify(config));
};

const removeFromConfig = (destination: string[], value: string) => {
	updateConfig();
	destination = destination.filter((val) => val !== value);
	fs.writeFileSync('config.json', JSON.stringify(config));
};

export const setAdminChannelId = (channelId: string) => {
	updateConfig();
	config.adminChannelId = channelId;
	fs.writeFileSync('config.json', JSON.stringify(config));
};

export const getAdminChannelId = () => {
	return config.adminChannelId;
};

export const addWhitelistGroup = (groupName: string) => {
	addToConfig(config.whitelist.groups.push, groupName);
};

export const addWhitelistIndividual = (cid: string) => {
	addToConfig(config.whitelist.individuals.push, cid);
};

export const addDefaultChannel = (channelName: string) => {
	addToConfig(config.defaultChannels.push, channelName);
};

export const removeWhitelistGroup = (groupName: string) => {
	removeFromConfig(config.whitelist.groups, groupName);
};

export const removeWhitelistIndividual = (cid: string) => {
	removeFromConfig(config.whitelist.individuals, cid);
};

export const removeDefaultChannel = (channelName: string) => {
	removeFromConfig(config.defaultChannels, channelName);
};

export const getDefaultChannels = (baseName?: string) => {
	return config.defaultChannels.map((channel) => {
		if (baseName) {
			return baseName + '-' + channel;
		}
		return channel;
	});
};

export const isWhitelisted = (user: GammaUser) => {
	// See if user is in whitelist
	if (config.whitelist.individuals.includes(user.nick)) {
		return true;
	}
	// See if user is part of whitelisted or active group
	const validatedGroups = user.groups.map((group) => {
		// See if group is whitelisted
		if (config.whitelist.groups.includes(group.name)) {
			return true;
		}
		// See if group is active
		if (group.superGroup && isFKIT(group.superGroup)) {
			return true;
		}
		return false;
	});
	return validatedGroups.includes(true);
};
