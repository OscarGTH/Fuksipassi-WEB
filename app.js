const express = require("express");
var path = require("path");
const mongoose = require("mongoose");
var helmet = require("helmet");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
var filter = require("content-filter");
var session = require("express-session");
var app = express();
var api = require(path.resolve(__dirname, "./routes/api.js"));
var db;

const hostname = "0.0.0.0";
const port = 5000;

mongoose.connect("mongodb://localhost/fuksipassi",{ useNewUrlParser: true }, function(err) {
  if (err) throw err;
  console.log("Successfully connected");
});
mongoose.set('useFindAndModify', false);
db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:" ));


app.use(
  session({
    secret: "flatscreen",
    resave: false,
    saveUninitialized: true
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(filter({dispatchToErrorHandler: true,methodList:['POST', 'DELETE','GET']}))
app.use(helmet());
app.use(expressValidator());




// Serving React app as static file
app.use("/", express.static(__dirname + "/client"));
// Routing api requests.
app.use("/api", api);


/* Error handling method */
app.use(function (err, req, res, next){ 
  console.log("error handling!" + err)
  // If the referer is the static react app, send response in json format.
  if(req.header('Referer') == 'http://localhost:3000/index.html?' || req.header('Referer') == 'http://localhost:3000/index.html'){
    res.status(400).json({message: "Forbidden characters found from input"})
  } 
})

app.listen(port, () =>
  console.log(`Server running at http://${hostname}:${port}/`)
);
