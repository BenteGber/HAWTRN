
const log = console.log;

// Yahoo WOEID for Atlanta
var queryLocation = '2357024';


var twitterQueryURL = 'https://cors-anywhere.herokuapp.com/' + 'https://api.twitter.com/1.1/trends/place.json?id=2357024'
//  + 'https://api.twitter.com/1.1/trends/place.json?id=' + queryLocation + "KVQPwF6rfmHriDZqkmRFStmxA";

$(document).ready(function () {
    $.ajax({
        url: twitterQueryURL,
        method: 'GET',
    })
        .then(function (response) {
            log(response);
        })
});

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



