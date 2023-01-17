import { App } from "@slack/bolt";

const registerSay = (app: App) => {
	// Example function
	app.command("/say", async ({ ack, payload, context }) => {
		// Acknowledge the command request
		ack();

		try {
			const result = await app.client.chat.postMessage({
				token: context.botToken,
				// Channel to send message to
				channel: payload.channel_id,
				// Text in the notification
				text: payload.text
			});
			console.log(result);
		} catch (error) {
			console.error(error);
		}
	});
};

export default registerSay;
