import { App } from '@slack/bolt';
import registerPurge from './purge';
import registerSay from './say';
import registerGet from './get';

const registerCommands = (app: App) => {
	registerSay(app);
	registerPurge(app);
	registerGet(app);
};

export default registerCommands;
