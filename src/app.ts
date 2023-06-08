// Require the Bolt package (github.com/slackapi/bolt)
import 'dotenv/config';
import { App } from '@slack/bolt';
import { initConfig } from './util/config';
import { prismaDisconnect } from './util/prisma';
import registerCommands from './commands/registercommands';
import registerEvents from './events/registerevents';

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	appToken: process.env.SLACK_APP_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true
});

// Initialize
initConfig();
registerCommands(app);
registerEvents(app);

(async () => {
	// Start your app
	await app.start(process.env.PORT || 3000);
	console.log('⚡️ app is running on ' + process.env.PORT + '!');
})()
	.then(async () => {
		await prismaDisconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prismaDisconnect();
		process.exit(1);
	});
