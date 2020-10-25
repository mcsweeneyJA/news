var express = require("express");
var router = express.Router();
const axios = require("axios");
require("dotenv").config();
var AWS = require("aws-sdk");

/* GET home page. */
router.get("/", function (req, res) {
  axios
    .get(
      "https://newsapi.org/v2/sources?apiKey=210d0241acc445e3b0603e086039cadc"
    )
    .then((response) => {
      var dataToRender = [];
      const data = response.data.sources;
      var counter = 0;
      // console.log(data)
      data.forEach((element) => {
        dataToRender[counter] = element;
        counter++;
      });
      // for (let key in allEvents) {

      // };
      // console.log(dataToRender);
      res.render("index", { data: dataToRender });
      // res.send('<h1>hello</h1>');

      // res.json({dataToRender});
    });
});

module.exports = router;
