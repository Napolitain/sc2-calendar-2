const express = require("express");
const redis = require("redis");
const axios = require("axios").default;
const router = express.Router();
const cheerio = require("cheerio");
const ical = require("node-ical");

/* GET home page. */
router.get('/', function(req, response, next) {
  response.render('index', { title: 'Express' });
  App.setPlayers(req.query.players);
  App.getData();
  App.scrapeData();
});

/**
 * Static class which is the whole application.
 */
class App {

    static EXPIRE_TIME = 300;
    static data = "";
    static client = redis.createClient();
    static players = [];

    /**
     * If data expired from Redis, calls App.getLiquipediaMatches,
     * otherwise return App.data
     * @returns {string}
     */
    static getData() {
        const d = App.client.get("data");
        return d != null ? d : App.getLiquipediaMatches();
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

    /**
     * Setter for Redis
     * @param d
     */
    static setData(d) {
        App.data = d;
        App.client.setex("data", App.EXPIRE_TIME, d);
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

    static scrapeData() {
        const $ = cheerio.load(App.data);
        for (let i = 0; i < App.players.length; i++) {
            App.players[i] = "[title='" + App.players[i] + "']";
        }
        let selectorString = ", ".join(App.players);
        const matches = $(".infobox_matches_content");
        for (const match of matches) {

        }
    }

    static generateEvent() {

    }
}

module.exports = router;
