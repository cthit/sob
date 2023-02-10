import { App } from "@slack/bolt";
import registerPurge from "./purge";
import registerReload from "./reload";
import registerSay from "./say";
import registerUpdate from "./update";

const registerCommands = (app: App) => {
	registerSay(app);
	registerReload(app);
	registerUpdate(app);
	registerPurge(app);
};

export default registerCommands;
