import { App } from '@slack/bolt';
import { sendMessage } from '../util/slack';

const registerGet = (app: App) => {
	app.command('/get', async ({ ack, payload, context }) => {
		ack();

		try {
			let result;
			switch (payload.text) {
				case 'channel':
					result = await sendMessage(app, payload.channel_id, payload.text);
					break;
				case 'user':
					result = await sendMessage(app, payload.channel_id, payload.user_id);
					break;
			}
			console.log(result);
		} catch (error) {
			console.error(error);
		}
	});
};

export default registerGet;
