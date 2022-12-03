import fs from "fs";

let currentWhitelist: [String];

export const updateWhitelist = () => {
	currentWhitelist = JSON.parse(fs.readFileSync("bot-whitelist.json", "utf-8"));
};

export const getWhitelist = () => [...currentWhitelist];
