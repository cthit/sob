import { App } from "@slack/bolt";
import registerOnJoinEvent from "./onjoin";

const registerEvents = (app: App) => {
	registerOnJoinEvent(app);
};

export default registerEvents;
