// Firebase Configuration

import apiKeys from "config.js";

// Initialize Firebase
const configFireBase = {
    apiKey: apiKeys.apiKeyFirebase,
    authDomain: "hawtrn-85a35.firebaseapp.com",
    databaseURL: "https://hawtrn-85a35.firebaseio.com",
    projectId: "hawtrn-85a35",
    storageBucket: "hawtrn-85a35.appspot.com",
    messagingSenderId: "1036899374376"
    };

firebase.initializeApp(configFireBase);
db = firebase.database();    


