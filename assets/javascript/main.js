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
