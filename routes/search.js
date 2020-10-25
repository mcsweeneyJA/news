const express = require("express");
const router = express.Router();
const axios = require("axios");
const redis = require("redis");
var natural = require("natural");
var tokenizer = new natural.WordPunctTokenizer();
var Analyzer = require("natural").SentimentAnalyzer;
var stemmer = require("natural").PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");

require("dotenv").config();
const AWS = require("aws-sdk");
// Cloud Services Set-up
// Create unique bucket name
// const bucketName = "mcsweeneyjac-news-store";
// // Create a promise on S3 service object
// const bucketPromise = new AWS.S3({ apiVersion: "2006-03-01" }).createBucket({ Bucket: bucketName }).promise();
// bucketPromise.then(function (data) {console.log("Successfully created " + bucketName);}).catch(function (err) {
//     console.error(err, err.stack);
// });


//////////////////// REDIS .//////////////////////////////////

const host =  "n8886997redis.km2jzi.ng.0001.apse2.cache.amazonaws.com";
const redisClient = redis.createClient(6379, host)
// const redisClient = redis.createClient()
redisClient.on("error", (err) => {
  console.log("Error " + err);
});

//GET all news articles matching a paramaterised title
router.get("/:search", function (req, res) {
  // const { title } = req.params;

  // var queryURI = encodeURI(title);
  const APIkey = "210d0241acc445e3b0603e086039cadc";
  var querySource = req.params.search;
  // console.log(querySource);
  var queryString =
    "https://newsapi.org/v2/top-headlines?sources=" +
    querySource +
    "&apiKey=210d0241acc445e3b0603e086039cadc";
  const s3Key = `news-${querySource}`;
  //call the news api and search for the specific event
  // search for both TITLE and CONTENT, and limit to 1 page
  // Try the cache


  const redisKey = `newss:${querySource}`;

  return redisClient.get(redisKey, (err, result) => {
    if (result) {
      // Serve from Cache
      const resultJSON = JSON.parse(result);
      console.log(resultJSON);
      const passThis = resultJSON.jsonSent;
      res.render("redisView", { data: passThis });
      // return res.status(200).json(resultJSON);
    } else {
        
    //     // Check S3
    //     const params = { Bucket: bucketName, Key: s3Key };
  
    //     return new AWS.S3({ apiVersion: "2006-03-01" }).getObject(
    //       params,
    //       (err, result) => {
    //         if (result) {
    //           const resultJSON = JSON.parse(result);
    //           console.log(result);
              
    //           res.render("searched", { data: resultJSON });
              
    //         } else {
                    return axios
                      .get(queryString)
                      .then((response) => {
                        const data = response.data;                       
                        
                        var tokenizedNews = tokenizer.tokenize(data.articles[0].description);
                        var sentiments = analyzer.getSentiment(tokenizedNews);
              
                        var resObj = {
                          payload: data,
                          sentiment: sentiments,
                        };
                        var jsonSent = resObj;
              
                        const body = JSON.stringify({
                            source: "S3 Bucket",
                            jsonSent,
                          });
                        
                        // const objectParams = {
                        //     Bucket: bucketName,
                        //     Key: s3Key,
                        //     Body: body,
                        //   };
                          
                        // const uploadPromise = new AWS.S3({ apiVersion: "2006-03-01" })
                        //   .putObject(objectParams)
                        //   .promise();

                        // uploadPromise.then(function (data) {
                        //     console.log(
                        //       "Successfully uploaded data to " + bucketName + "/" + s3Key
                        //     );
                        //   });

                        redisClient.setex(
                            redisKey,
                            3600,
                            JSON.stringify({ source: "Redis Cache", jsonSent })
                          );
          
                      res.render("searched", { data: resObj });
                    }).catch((error) => console.log(error));
            }
          }
        );
      // }
    // });
});


module.exports = router;
