// Require the Bolt package (github.com/slackapi/bolt)
import 'dotenv/config'
import { App } from "@slack/bolt";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true
});


// Example function
app.command('/say', async ({ ack, payload, context }) => {
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
    }
    catch (error) {
      console.error(error);
    }
  });

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ app is running on ' + process.env.PORT + '!');
})();
