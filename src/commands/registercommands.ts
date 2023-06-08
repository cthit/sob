import { App } from '@slack/bolt';
import registerPurge from './purge';
import registerSay from './say';

const registerCommands = (app: App) => {
	registerSay(app);
	registerPurge(app);
};

export default registerCommands;
