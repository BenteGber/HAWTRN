const log = console.log;

// Yahoo WOEID for Atlanta
var queryLocation = 2357024;

var twitterQueryURL = 'https://cors-anywhere.herokuapp.com/' + 'https://api.twitter.com/1.1/trends/place.json?id=2357024' + 'https://api.twitter.com/1.1/trends/place.json?id=' + queryLocation;

$(document).ready(function () {
    $.ajax({
        url: queryURL,
        method: 'GET',
    })
        .then(function (response) {

            var results = response.data();

            log(results);
        })
});
