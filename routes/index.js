var express = require("express");
var router = express.Router();
const axios = require("axios");
require("dotenv").config();
var AWS = require("aws-sdk");

/* GET home page. */
router.get("/", function (req, res) {
  const url = "https://newsapi.org/v2/sources?apiKey=210d0241acc445e3b0603e086039cadc";
  axios
    .get(url)
    .then((response) => {

      var dataToRender = [];
      const data = response.data.sources;
      var counter = 0;
      
      data.forEach((element) => {
        dataToRender[counter] = element;
        counter++;
      });

      res.render("index", { data: dataToRender });
    });
});

module.exports = router;
