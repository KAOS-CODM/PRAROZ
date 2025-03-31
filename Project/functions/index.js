const functions = require("firebase-functions");
const app = require("./server");

exports.api = functions.https.onRequest(app);
