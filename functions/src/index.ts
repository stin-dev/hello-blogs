import * as functions from 'firebase-functions';
import { executeScraping } from './scraping';

export const scraping = functions.pubsub.schedule("every 5 minutes").onRun(async context => {
	await executeScraping();
});
