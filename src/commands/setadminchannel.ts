import { App } from '@slack/bolt';

// TODO: Implement'
const registerSetAdminChannel = (app: App) => {
	app.command('/setadminchannel', async ({ ack, payload, context }) => {
		ack();
		try {
		} catch (e) {
			console.log(e);
		}
	});
};

export default registerSetAdminChannel;
