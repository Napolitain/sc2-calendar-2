import {Sc2Calendar} from "./sc2Calendar";

const express = require("express");
const router = express.Router();

/* GET home page. */
router.get('/', function(req, response, next) {
  Sc2Calendar.setPlayers(req.query.players);
  Sc2Calendar.getData();
  const ical = Sc2Calendar.getCalendar();
  response.set("Content-Disposition", "attachment; filename=sc2calendar.ics");
  response.send(ical.toString());
});

module.exports = router;
