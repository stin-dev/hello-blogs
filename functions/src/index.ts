import * as functions from 'firebase-functions';
import { executeScraping } from './scraping';
import { retryToGetImageUrls } from "./retry";

export const scraping = functions.pubsub.schedule("every 5 minutes").onRun(async context => {
	await executeScraping();
});

export const retry = functions.https.onCall((data, context) => {
	if (!context.auth) throw new functions.https.HttpsError("failed-precondition", "Sign in required.");

	const uid = context.auth.uid;
	if (uid !== `lQXUROyoFdV5N9DHn9RqAaeegru2`)
		throw new functions.https.HttpsError("permission-denied", "You do not have admin rights.");

	const entryId = data.entryId;
	if (!(typeof entryId === "string") || entryId.length === 0)
		throw new functions.https.HttpsError("invalid-argument",
			`This function must be called with one arguments "entryId" containing the Id to search.`);

	return retryToGetImageUrls(entryId);
})