import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

export const addMessage = functions.https.onRequest(async (req, res) => {
	const docRef = db.collection("first-collection").doc("text");

	const original: string = req.query.text;

	await docRef.set({
		original: original,
	});

	res.status(200).send(`Your text is ${original}! Thank you!`);
});
