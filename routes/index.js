const express = require("express");
const axios = require("axios").default;
const router = express.Router();
const cheerio = require("cheerio");
const ical = require("node-ical");

/* GET home page. */
router.get('/', function(req, response, next) {
  response.render('index', { title: 'Express' });
  App.setPlayers(req.query.players);
  //App.getLiquipediaMatches()
});

/**
 * Static class which is the whole application.
 */
class App {

    /**
     * HTML page
     * @type {string}
     */
    static data = "";

    /**
     * Players list (from querystring)
     * @type {[]}
     */
    static players = [];

    /**
     * If data expired from Redis, calls App.getLiquipediaMatches,
     * otherwise return App.data
     * @returns {string}
     */
    static getData() {
        return App.data;
    }

    /**
     * Setter for App.data and for Redis
     * @param d
     */
    static setData(d) {
        App.data = d;
    }

    /**
     * Setter for App.players from Express querystring
     * @param p
     */
    static setPlayers(p) {
        App.players = [];
        for (const player of p) {
            App.players.push(player);
        }
    }

    /**
     * Function that requests Liquipedia upcoming matches,
     * if it doesn't work, log error
     */
    static getLiquipediaMatches() {
        axios.get("https://liquipedia.net/starcraft2/Liquipedia:Upcoming_and_ongoing_matches", {
            headers: {
                "Accept-Encoding": "gzip",
                "User-Agent": "User-Agent\": \"Sc2Calendar/developer (mxboucher@gmail.com)"
            },
        })
            .then(function (response) {
                App.setData(response.data);
            })
            .catch(function (error) {
                console.error("Couldn't request to Liquipedia: ", error);
            })
    }

    static scrapeData() {
        let matches = App.get
    }

    static generateEvent() {

    }
}

module.exports = router;
