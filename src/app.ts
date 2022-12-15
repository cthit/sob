// Require the Bolt package (github.com/slackapi/bolt)
import "dotenv/config";
import { App } from "@slack/bolt";
import { registerSay } from "./commands/say";
import { registerReload } from "./commands/reload";
import { registerUpdate } from "./commands/update";
import { registerOnJoinEvent } from "./events/onjoin";
import { updateWhitelist } from "./util/whitelist";
import { prismaDisconnect } from "./util/prisma";

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	appToken: process.env.SLACK_APP_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true
});

// Initialize
updateWhitelist();

// Register commands
registerSay(app);
registerReload(app);
registerUpdate(app);
// Register events
registerOnJoinEvent(app);

(async () => {
	// Start your app
	await app.start(process.env.PORT || 3000);
	console.log("⚡️ app is running on " + process.env.PORT + "!");
})()
	.then(async () => {
		await prismaDisconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prismaDisconnect();
		process.exit(1);
	});
