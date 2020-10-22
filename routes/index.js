var express = require('express');
var https = require("https");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, response, next) {
  response.render('index', { title: 'Express' });
});

/**
 * Function that requests Liquipedia upcoming matches
 */
function getLiquipediaMatches() {
  let options = {
    hostname: "liquipedia.net",
    port: 443,
    path: "/starcraft2/api.php?action=parse&format=json&page=Liquipedia:Upcoming_and_ongoing_matches",
    method: "GET"
  };
  let request = https.request(options, response => {
    response.on("data", data => {
      return data;
    });
  });
  request.on("error", error => {
    console.error("Error while requesting data to Liquipedia: ", error);
  });
}

module.exports = router;
