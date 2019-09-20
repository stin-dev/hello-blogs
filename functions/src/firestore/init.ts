import * as admin from "firebase-admin";

// debug
//const serviiceAccount = require("../../firestore_key.json");
//admin.initializeApp({ credential: admin.credential.cert(serviiceAccount) });

// release
admin.initializeApp();

export const firestore = admin.firestore();