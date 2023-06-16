import { App } from '@slack/bolt';
import registerPurge from './purge';
import registerSay from './say';
import registerGet from './get';
import registerPurgeList from './purgelist';

const registerCommands = (app: App) => {
	registerSay(app);
	registerGet(app);
	// registerPurge(app);
	registerPurgeList(app);
};

export default registerCommands;
