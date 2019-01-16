
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
firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
      
        // For accessing the Twitter API.
        hGlobal["token"] = result.credential.accessToken;
        hGlobal["secret"] = result.credential.secret;
    }
    hGlobal["user"] = result.user;
  });
  
// Start a sign in process for an unauthenticated user.
let provider = new firebase.auth.TwitterAuthProvider();

firebase.auth().onAuthStateChanged(function(user) {
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
            addUser(hGlobal.userId,userData);   
        }
    } else {
      // User is signed out
        firebase.auth().signInWithRedirect(provider);
        firebase.auth().getRedirectResult().then(function(result) {
            if (result.credential) {
                hGlobal["token"] = result.credential.accessToken;
                hGlobal["secret"] = result.credential.secret;
                hGlobal["user"]  = result.user;
            }
        }).catch(function(error) {
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

const addUser = (userId,userData) => {
    if(!userExists(userId)) {   
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
  $(".check").click(function(){
    $("#my-check").prop("checked", true);
});
$(".uncheck").click(function(){
    $("#my-check").prop("checked", false);
});

// Adding checked boxes to favorites array


