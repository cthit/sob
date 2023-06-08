import { App } from '@slack/bolt';

// TODO: Implement'
const registerReloadConfig = (app: App) => {
	app.command('/reloadconfig', async ({ ack, payload, context }) => {
		ack();
		try {
		} catch (e) {
			console.log(e);
		}
	});
};

export default registerReloadConfig;
