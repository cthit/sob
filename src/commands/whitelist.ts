import { App } from '@slack/bolt';

// TODO: Implement'
const registerWhitelist = (app: App) => {
	app.command('/whitelist', async ({ ack, payload, context }) => {
		ack();
		try {
		} catch (e) {
			console.log(e);
		}
	});
};

export default registerWhitelist;
