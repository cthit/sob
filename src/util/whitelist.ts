import fs from "fs";

let currentWhitelist: [string];

export const updateWhitelist = () => {
	currentWhitelist = JSON.parse(fs.readFileSync("bot-whitelist.json", "utf-8"));
};

export const getWhitelist = () => [...currentWhitelist];
