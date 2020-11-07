import {Sc2Calendar} from "./sc2Calendar";

const express = require("express");
const router = express.Router();

/* GET home page. */
router.get('/', function(req, response, next) {
  response.render('index', { title: 'Express' });
  Sc2Calendar.setPlayers(req.query.players);
  Sc2Calendar.getData();
  Sc2Calendar.getCalendar();
});

module.exports = router;
