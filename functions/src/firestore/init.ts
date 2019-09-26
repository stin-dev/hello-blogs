import * as admin from "firebase-admin";

// debug
//const serviceAccount = require("../../firestore_key.json");
//admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// release
admin.initializeApp();

export const firestore = admin.firestore();