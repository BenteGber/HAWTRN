
const log = console.log;

// Firebase Configuration


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

let db = firebase.database();
let usersRef = db.ref("/users")

// Using a redirect
firebase.auth().getRedirectResult().then(function (result) {
    if (result.credential) {

        // For accessing the Twitter API.
        hGlobal["token"] = result.credential.accessToken;
        hGlobal["secret"] = result.credential.secret;
    }
    hGlobal["user"] = result.user;
});

// Start a sign in process for an unauthenticated user.
let provider = new firebase.auth.TwitterAuthProvider();

firebase.auth().onAuthStateChanged(function (user) {
    if (hGlobal.user) {
        // User is signed in
        hGlobal["displayName"] = user.displayName;
        hGlobal["photoURL"] = user.photoURL;
        hGlobal["userId"] = user.uid;

        let providerData = user.providerData;

        // See if the user exists
        if (userExists(hGlobal.userId)) {
            const lastLogin = { lastLogin: firebase.database.ServerValue.TIMESTAMP };
            db.ref(`/users/${hGlobal.userId}`).set(lastLogin, (error) => {
                (error ? console.log("Errors handled " + error) : console.log("Last login successfully updated. "));
            });
        } else {
            // User doesn't exist, add them to the Firebase Users
            const userData = {
                name: hGlobal.displayName,
                photo: hGlobal.photoURL,
                joined: firebase.database.ServerValue.TIMESTAMP,
                lastLogin: firebase.database.ServerValue.TIMESTAMP
            }
            addUser(hGlobal.userId, userData);
        }
    } else {
        // User is signed out
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


// Filling in stars to add to favorites - still a work in progress....
// $('[data-rating] .star').on('click', function() {
//     var selectedCssClass = 'selected';
//     var $this = $(this);
//     $this.siblings('.' + selectedCssClass).removeClass(selectedCssClass);
//     $this
//       .addClass(selectedCssClass)
//       .parent().addClass('is-voted');
//   });


// We can use check boxes for now!!! Easier!!!
$(".check").click(function () {
    $("#my-check").prop("checked", true);
});
$(".uncheck").click(function () {
    $("#my-check").prop("checked", false);
});

// Adding checked boxes to favorites array



function TweetCard(id, name, handle, profileImg, profileUrl, bodyText, likes, createdAt, retweetCount, tweetUrl) {
    this.id = id;
    this.name = name;
    this.handle = handle;
    this.profileImg = profileImg;
    this.profileUrl = profileUrl;
    this.bodyText = bodyText;
    this.likes = likes;
    this.createdAt = createdAt;
    this.retweeCount = retweetCount;
    this.tweetUrl = tweetUrl;
    this.favorited = null;
    this.addToFavorites = () => {
        log(this.favorited);
    }
}

$(document).ready(function () {
    $.ajax({
        url: 'https://gt-example-teets.herokuapp.com/twitter/api',
        method: 'POST',
        data: {
            path: '/search/tweets',
            q: 'America',
            geocode: '37.781157,-122.398720,5mi'
        }
    })
        .then(function (data) {
            console.log('Data: ', data);
            let tweets = data.statuses;
            tweets.forEach(function (el, index) {
                log("element------------", el, index)
                window['card' + index] = new TweetCard(
                    el.id,
                    el.user.name,
                    el.user.screen_name,
                    el.user.profile_image_url,
                    el.user.url,
                    el.text,
                    el.entities.favorite_count,
                    // Need to trim this string down 
                    el.created_at,
                    el.retweet_count,
                    el.source)
                let tweetID = el.id;
                let username = el.user.name.trim();
                let userId = el.user.id_str;
                let screenname = el.user.screen_name;
                let idString = el.id_str;
                let text = el.text;
                let embedUrl = 'https://twitter.com/' + userId + '/statuses/' + idString + '?ref_src=twsrc%5Etfw';
                embedUrl = embedUrl.replace(' ', '');
                log(embedUrl);
                let tweetDate = el.created_at;
                tweetDate = tweetDate.slice(0, 20);

                $('.tweet-area').append(`
                <blockquote class="twitter-tweet" data-lang="en">
                // <p lang="en"dir="ltr"> ${ text}</p>&mdash; 
                ${username} 
                (@${screenname}) <a id ="${tweetID}"href="${embedUrl}"> ${tweetDate}</a ></blockquote>
                            <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`)

            });
        }
        )
})






// let hasLocation = getLocation()
// var lat = '';
// var long = '';



function getLocation() {
    navigator.geolocation.getCurrentPosition(function (position) {
        lat = position.coords.latitude + "";
        long = position.coords.longitude + "";
        log(lat, long, "COORDINATES")
        return true;
    }, function (error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.")
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.")
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.")
                break;
        };
        return false;
    })

}


// Promise function for controlling state. 

let promise1 = new Promise( (resolve, reject) => {
    if (dataReceivedSuccessfully) 
      resolve("Data Available!");
    
    if (!dataReceivedSuccessfully) 
      reject("Data Corrupted!");
    });

    promise1.then(getTweets) 
        console.log("Success!")

    .catch(function(error) {
        console.log("Failed!");
}

    

// let promise1 = new Promise((resolve, reject) => {

//     if (hasLocation) {
//         resolve(success)

//     }
//     else {
//         reject(error);
//     }
// })
// promise1.then(() => {

// })


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





