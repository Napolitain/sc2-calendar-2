const redis = require("redis");
const axios = require("axios").default;
const cheerio = require("cheerio");
const ical = require("ical-generator");

/**
 * Static class which is the whole application.
 */
export class Sc2Calendar {

	static #EXPIRE_TIME = 300;
	static #data = "";
	static #client = redis.createClient();
	static #players = [];

	/**
	 * If data expired from Redis, calls Sc2Calendar.getLiquipediaMatches,
	 * otherwise return Sc2Calendar.data
	 * @returns {string}
	 */
	static getData() {
		const d = Sc2Calendar.#client.get("data");
		return d != null ? d : Sc2Calendar.getLiquipediaMatches();
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
				Sc2Calendar.setData(response.data);
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
		Sc2Calendar.#data = d;
		Sc2Calendar.#client.setex("data", Sc2Calendar.#EXPIRE_TIME, d);
	}

	/**
	 * Setter for Sc2Calendar.players from Express querystring
	 * @param p
	 */
	static setPlayers(p) {
		Sc2Calendar.#players = [];
		for (const player of p) {
			Sc2Calendar.#players.push(player);
		}
	}

	/**
	 * Scrape from data the matches we want to track.
	 * Generate iCalendar event and return it.
	 * @returns {ical}
	 */
	static getCalendar() {
		const $ = cheerio.load(Sc2Calendar.#data);
		for (let i = 0; i < Sc2Calendar.#players.length; i++) {
			Sc2Calendar.#players[i] = "[title='" + Sc2Calendar.#players[i] + "']";
		}
		const selectorString = Sc2Calendar.#players.join(", ");
		const matches = $(".infobox_matches_content");
		let cal = ical({
			domain: 'sc2calendar.com',
			name: 'Sc2Calendar',
		});
		for (const match of matches) {
			const selected_match = match.find(selectorString); // if match contain a tracked player
			if (selected_match) {
				const teamleft = match.find(".team-left").text(); // Serral
				const teamright = match.find(".team-right").text(); // Maru
				const matchFormat = match.find(".versus").eq(1).text() // Bo5
				const timeMatch = match.find("[data-timestamp]").attr("data-timestamp"); // 1601010021290
				const tournament = match.find(".match-filler div div").text();
				cal.createEvent({
					summary: teamleft + "-" + teamright,
					location: tournament + "(" + matchFormat + ")",
					uid: (timeMatch + teamleft + teamright + tournament + "@sc2calendar").replace(" ", ""),
					start: new Date(parseInt(timeMatch)),
					end: new Date(parseInt(timeMatch) + 2400),
					timestamp: new Date(Date.now()),
				});
			}
		}
		return cal;
	}

}