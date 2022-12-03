// Require the Bolt package (github.com/slackapi/bolt)
import "dotenv/config";
import { App } from "@slack/bolt";
import { registerSay } from "./commands/say";

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	appToken: process.env.SLACK_APP_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true
});

// Register commands
registerSay(app);

// Register events

(async () => {
	// Start your app
	await app.start(process.env.PORT || 3000);
	console.log("⚡️ app is running on " + process.env.PORT + "!");
})();
