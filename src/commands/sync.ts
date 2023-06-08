import { App } from '@slack/bolt';

// TODO: Implement'
const registerSync = (app: App) => {
	app.command('/sync', async ({ ack, payload, context }) => {
		ack();
		try {
		} catch (e) {
			console.log(e);
		}
	});
};

export default registerSync;
