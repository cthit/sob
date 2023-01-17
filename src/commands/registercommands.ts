import { App } from "@slack/bolt";
import registerReload from "./reload";
import registerSay from "./say";
import registerUpdate from "./update";

const registerCommands = (app: App) => {
	registerSay(app);
	registerReload(app);
	registerUpdate(app);
};

export default registerCommands;
