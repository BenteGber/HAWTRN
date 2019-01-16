
const log = console.log;

const configFireBase = {
    apiKey: "AIzaSyCDxL0zvea3jzl8N1lk9mPbahQ4Dlj0Aa4",
    authDomain: "hawtrn-85a35.firebaseapp.com",
    databaseURL: "https://hawtrn-85a35.firebaseio.com",
    projectId: "hawtrn-85a35",
    storageBucket: "hawtrn-85a35.appspot.com",
    messagingSenderId: "1036899374376"
};

const hGlobal = new Object();

// Initialize Firebase

firebase.initializeApp(configFireBase);
db = firebase.database();

let usersRef = db.ref("/users")


// Using a redirect.
firebase.auth().getRedirectResult().then(function (result) {
    if (result.credential) {
        // For accessing the Twitter API.
        hGlobal["token"] = result.credential.accessToken;
        hGlobal["secret"] = result.credential.secret;
    }
    hGlobal["user"] = result.user;
});

// Start a sign in process for an unauthenticated user.
var provider = new firebase.auth.TwitterAuthProvider();
// firebase.auth().signInWithRedirect(provider);


firebase.auth().onAuthStateChanged(function (user) {
    if (hGlobal.user) {
        // User is signed in.
        let displayName = user.displayName;
        let email = user.email;
        let emailVerified = user.emailVerified;
        let photoURL = user.photoURL;
        let isAnonymous = user.isAnonymous;
        let userId = user.uid;
        hGlobal["userId"] = userId;
        let providerData = user.providerData;
        console.log(displayName);
        console.log(user.uid);
        const userData = {
            name: displayName,
            email: email,
            photo: photoURL
        }
        addUser(userId, userData);
        // ...
    } else {
        // User is signed out.
        firebase.auth().signInWithRedirect(provider);
        firebase.auth().getRedirectResult().then(function (result) {
            if (result.credential) {
                hGlobal["token"] = result.credential.accessToken;
                hGlobal["secret"] = result.credential.secret;
                hGlobal["user"] = result.user;
            }
        }).catch(function (error) {
            let c = error.code;
            let m = error.message;
            let e = error.email;
            let cr = error.credential;
            console.log(c);
            console.log(m);
            console.log(e);
            console.log(cr);
        });
    }
});

const userExists = (userId) => {
    usersRef.child(userId).once("value", (snapshot => {
        let exists = (snapshot.val() !== null);
        return exists;
    }))

}

const addUser = (userId, userData) => {
    if (!userExists(userId)) {
        db.ref(`/users/${userId}`).set(userData, (error) => {
            (error ? console.log("Errors handled " + error) : console.log("User successfully added to the database. "));
        });
    }
}



// $(document).ready(function () {
//     $.ajax({
//         url: twitterQueryURL,
//         method: 'GET',
//     })
//         .then(function (response) {
//             log(response);
//         })
// });

$(document).ready(function () {
    //if this doesnt work make sure the baseUrl includes cors-anywhere next time
    let baseUrl = 'https://api.twitter.com/1.1/search/tweets.json';
    let reqHeader = "OAuth ";
    let randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


    //Prepare signature
    let signatureBase = "GET" + "&" + encodeURIComponent(baseUrl) + "&";
    let oauthToken = hGlobal.token;
    let consumerKey = hGlobal.secret;

    let paramString = encodeURIComponent("include_entities") + "=" + encodeURIComponent("true") + "&";
    paramString += encodeURIComponent("oauth_consumer_key") + "=" + encodeURIComponent("KVQPwF6rfmHriDZqkmRFStmxA") + "&";
    paramString += encodeURIComponent("oauth_nonce") + "=" + encodeURIComponent(randomString) + "&";
    paramString += encodeURIComponent("oauth_signature_method") + "=" + encodeURIComponent("HMAC-SHA1") + "&";
    paramString += encodeURIComponent("oauth_timestamp") + "=" + encodeURIComponent(Date.now()) + "&";

    //is this the OAuth token? This is what firebase passes back on succesful twitter authorization so assuming yes
    paramString += encodeURIComponent("oauth_token") + "=" + encodeURIComponent("VVJqgYR1vseS4SKI2GiqtYh49m63") + "&";
    paramString += encodeURIComponent("oauth_version") + "=" + encodeURIComponent("1.0") + "&";

    //These are going to be hardcoded for now but we need to come up with a little logic to make this dynamic:
    paramString += encodeURIComponent("q") + "=" + encodeURIComponent("trump");

    //when paramString is done append it to the signature:
    signatureBase += encodeURIComponent(paramString);

    //create signing key
    // let consumerKey = 'nDN4aM36VtZ0tM8YNqijhhyHl2AHfPOxZL5KWjx4dqMG8S4byR'; //(API Secret Key from dashboard)
    // let oauthToken = 'VVJqgYR1vseS4SKI2GiqtYh49m63';

    log("token____", hGlobal.token, "Secret*****", hGlobal.secret);

    //if it doesn't work, try the below line of code without oauthToken but still leave the ampersand at the end:
    let signingKey = encodeURIComponent(consumerKey) + "&" + encodeURIComponent(oauthToken);

    let hash = CryptoJS.HmacSHA1(consumerKey, oauthToken);

    let signature = hash.toString(CryptoJS.enc.Base64);

    console.log("big effin signature: ", signatureBase);
    console.log("omg please wooooork    ", signature);

    reqHeader += encodeURIComponent("oauth_consumer_key") + "=" + "\"\"" + encodeURIComponent("value") + "\"\"" + ", ";
    reqHeader += encodeURIComponent("oauth_nonce") + "=" + "\"\"" + encodeURIComponent(randomString) + "\"\"" + ", ";
    reqHeader += encodeURIComponent("oauth_signature") + "=" + "\"\"" + encodeURIComponent(signature) + "\"\"" + ", ";
    reqHeader += encodeURIComponent("oauth_signature_method") + "=" + "\"\"" + encodeURIComponent("HMAC-SHA1") + "\"\"" + ", ";
    reqHeader += encodeURIComponent("oauth_timestamp") + "=" + "\"\"" + encodeURIComponent(Date.now()) + "\"\"" + ", ";
    reqHeader += encodeURIComponent("oauth_token") + "=" + "\"\"" + encodeURIComponent(oauthToken) + "\"\"" + ", ";
    reqHeader += encodeURIComponent("oauth_version") + "=" + "\"\"" + encodeURIComponent("1.0");

    console.log("I'm freaking ouuuuut", reqHeader)
    $.ajax({
        url: `https://cors-anywhere.herokuapp.com/${baseUrl}`,
        headers: {
            "Authorization": reqHeader,
        },
        method: 'GET',
    })
        .then(function (response) {
            console.log("RESPONSE!!!!!", response);
        })
        .catch((err) => {
            console.log("ERROR! ERROR!", err);
        });
});



// var lat = '';
// var long = '';
// var htmlGeo = lat + long;


// function getLocation() {
//     navigator.geolocation.getCurrentPosition(function (position) {
//         lat = position.coords.latitude + "";
//         long = position.coords.longitude + "";
//         log(lat, long, htmlGeo)
//     }, function (error) {
//         switch (error.code) {
//             case error.PERMISSION_DENIED:
//                 alert("User denied the request for Geolocation.");
//                 break;
//             case error.POSITION_UNAVAILABLE:
//                 alert("Location information is unavailable.")
//                 break;
//             case error.TIMEOUT:
//                 alert("The request to get user location timed out.")
//                 break;
//             case error.UNKNOWN_ERROR:
//                 alert("An unknown error occurred.")
//                 break;
//         };
//     })

// }
// getLocation();

// // Promise function for controlling state. 
// function promiseFunc() {
//     return new Promise(function (resolve, reject) {
//         if (success) {
//             resolve;
//         }
//         else {
//             reject;
//         }
//     })
// }

// promiseFunc()
//     .then(function (data) {
//         log("Data", data)
//     })
//     .catch(function (error) {
//         log("Error", error)
//     });

// // Yahoo WOEID for Atlanta for testing purposes
// // let queryLocation = '2357024';

// let tweetDataURL = 'https://api.twitter.com/1.1/search/tweets.json?q=' + trend + "&geocode=" + htmlGeo + radius;
// // It is also possible to add a result type: Recent, Popular, Mixed   ex &result_type=recent  **mixed is default**

// let yahooQueryURL = "https://yboss.yahooapis.com/geo/placefinder?location=" + htmlGeo;
// let queryLocation = data.woeid.val();

// var twitterQueryURL = 'https://cors-anywhere.herokuapp.com/' + 'https://api.twitter.com/1.1/trends/place.json?id=2357024'
// //  + 'https://api.twitter.com/1.1/trends/place.json?id=' + queryLocation + "KVQPwF6rfmHriDZqkmRFStmxA";


// Firebase Configuration



