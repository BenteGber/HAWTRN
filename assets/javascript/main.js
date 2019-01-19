
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
    if (user) {
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
                "name": hGlobal.displayName,
                "photo": hGlobal.photoURL,
                "joined": firebase.database.ServerValue.TIMESTAMP,
                "lastLogin": firebase.database.ServerValue.TIMESTAMP
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

//  Functions to add the favorites to Firebase

const favs = {
    addTweet(userId, tweet) {
        let fType = "Tweet";
        let tweetURL = $(tweet).attr("data-tweetURL");

        const fData = {
            "url": tweetURL,
            "dateAdded": firebase.database.ServerValue.TIMESTAMP
        }

        favs.addFav(userId, fType, fData);
    },

    // Extra feature, this probably isn't going to make it into the MVP
    addTrend(userId, trend) {
        let fType = "Trend";
        let trendInfo = trend;

        const fData = {
            "name": $(trendInfo).attr("data-name"),
            "url": $(trendInfo).attr("data-url"),
            "promoted_content": $(trendInfo).attr("data-promoted_content"),
            "query": $(trendInfo).attr("data-query"),
            "tweet_volume": $(trendInfo).attr("tweet_volume")
        }

        favs.addFav(userId, fType, fData);
    },

    addFav(userId, fType, fData) {
        db.ref(`/fav${fType}/${userId}`).push(fData, (error) => {
            (error ? console.log("Errors handled " + error) : console.log("Favorite successfully added to the database. "));
        });
    },

    deleteFav() {
        // Future option to delete favorites
    },

    getFavTweets() {
        let userId = hGlobal.userId;
        let tweetLinks = [];
        db.ref(`/favTweet/${userId}`).orderByChild("dateAdded").on("child_added", function (ss) {
            let sv = ss.val();
            tweetLinks.push(sv.url);
        });
        return tweetLinks;
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
    addTrend(userId, $(this));
});
$(".uncheck").click(function () {
    $("#my-check").prop("checked", false);
});

// Adding checked boxes to favorites array





// let latestTweet = localStorage.latestTweet;
let queryTopic = "coding";
let geocode = "";
let radius = "40mi";
let searchtype = 'mixed';

$('#search-button').click(function () {
    let searchString = $('#hawt-search').val().trim();
    let trend = searchString.replace(/\s/g, '');
    queryTopic = searchString.replace(/\s/g, '+');
    if (trend !== '') {
        $('.trends-links').append(`<li class="trend"><a class="trend-item" href="#" data-trend='${trend}'>#${trend}</a>
                            
                            </li>`)
    };
    $('#hawt-search').val('');
    $('.tweet-area').html('');
    getTweets();
});

$(document).on('click', '.trend-item', (event) => {
    event.preventDefault();
    queryTopic = event.target.text.replace(/\#/, '');
    $('.tweet-area').html('')
    getTweets();
});
$('#top').on('click', (event) => {
    log(event);
    $(document).ready(function () {
        searchtype = 'popular';
        getTweets();
    });
})
$('#favorites').on('click', (event) => {
    log(event);
    window.setTimeout(() => {
        $('#favorite-area').innerHTML('');
        let favTweets = favs.getFavTweets();
        favTweets.forEach((el) => {
            $('#favorite-area').html(`
                <blockquote class="twitter-tweet" data-lang="en">
                <button></button>
                // <p lang="en"dir="ltr"></p>&mdash; 
                
                (@) <a id =""href="${el}"> </a ></blockquote>
                            <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
                            <div>
                                <button class ="btn btn-primary favThis" data-tweetURL="${el}">Fave it</button>
                            </div>`);
        })
    }, 1000);

});


$('#latest').on('click', (event) => {
    $(document).ready(function () {
        searchtype = 'recent';
        getTweets();
    });
})


function getTweets() {
    // changes global variable geocode so any instance of 
    geocode = localStorage.geocode;
    // if (latestTweet == undefined) {
    //     latestTweet = '';
    // }
    $.ajax({
        url: 'https://gt-example-teets.herokuapp.com/twitter/api',
        method: 'POST',
        data: {
            path: '/search/tweets',
            q: queryTopic,
            geocode: geocode.concat(radius),
            result_type: searchtype
        }
    })
        .then(function (data) {
            let tweets = data.statuses;
            // if (tweets.id > parseInt(latestTweet))// Keeps tweet query from being empty
            //     localStorage.latestTweet = '';       /// if no new tweets have occured
            tweets.forEach(function (el, ) {

                let tweetID = el.id;
                let username = el.user.name.trim();
                let userId = el.user.id_str;
                let screenname = el.user.screen_name;
                let idString = el.id_str;
                let text = el.text;
                let embedUrl = 'https://twitter.com/' + userId + '/statuses/' + idString + '?ref_src=twsrc%5Etfw';
                embedUrl = embedUrl.replace(' ', '');
                let tweetDate = el.created_at;
                tweetDate = tweetDate.slice(0, 20);
                $('.tweet-area').append(`
                <blockquote class="twitter-tweet" data-lang="en">
                <button></button>
                // <p lang="en"dir="ltr"> ${ text}</p>&mdash; 
                ${username} 
                (@${screenname}) <a id ="${tweetID}"href="${embedUrl}"> ${tweetDate}</a ></blockquote>
                            <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
                            <div>
                                <button class ="btn btn-primary favThis" data-tweetURL="${embedUrl}">Fave it</button>
                            </div>`);

                // if (index > tweets.length - 2) {
                //     log(latestTweet);
                //     localStorage.latestTweet = idString;

                // };

            });
        }
        )

}


// Set the event listener for the favorite button
window.setTimeout(() => {   // It would be nice to do this with a promise so that when getTweets is done the listner is added. But this works.
    $(".favThis").on("click", function () {
        favs.addTweet(hGlobal.userId, this);
    });
}, 1000);




$(".hawt-search").click(function () {
    let searchstring = $(this).text("#search");
    searchstring.focus(), trim(), replaceAll("+");
    $("#searchBox").html($("input:search").val());
});




let getUserCurrentLocation = new Promise((resolve, reject) => {
    //Location function
    navigator.geolocation.getCurrentPosition(function (position) {
        const lat = position.coords.latitude + "";
        const long = position.coords.longitude + "";
        const geocode = lat.concat(',', long, ',', radius);
        resolve({
            lat,
            long,
            geocode
        });
    }, function (error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                reject("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                reject("Location information is unavailable.")
                break;
            case error.TIMEOUT:
                reject("The request to get user location timed out.")
                break;
            case error.UNKNOWN_ERROR:
                reject("An unknown error occurred.")
                break;
        };
    })
});
getUserCurrentLocation
    .then(function (data) {


        TODO:
        localStorage.setItem('geocode', data.geocode);
        getTweets() //pass data to the getTweets function in order to get the coordination
    })
    .catch(function (error) {
        console.log('error: ', error);
    })



// Constructor for tweetcard objects
// function TweetCard(id, name, handle, profileImg, profileUrl, bodyText, likes, createdAt, retweetCount, tweetUrl) {
//     this.id = id;
//     this.name = name;
//     this.handle = handle;
//     this.profileImg = profileImg;
//     this.profileUrl = profileUrl;
//     this.bodyText = bodyText;
//     this.likes = likes;
//     this.createdAt = createdAt;
//     this.retweeCount = retweetCount;
//     this.tweetUrl = tweetUrl;
//     this.favorited = null;
//     this.addToFavorites = () => {
//         log(this.favorited);
//     }
// }