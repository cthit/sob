import { App } from '@slack/bolt';

// TODO: Implement'
const registerDefaultChannels = (app: App) => {
	app.command('/defaultchannels', async ({ ack, payload, context }) => {
		ack();
		try {
		} catch (e) {
			console.log(e);
		}
	});
};

export default registerDefaultChannels;
