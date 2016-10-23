var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

//data base
// username - vsri293
// password - digitized

var db;

MongoClient.connect('mongodb://vsri293:digitized@ds057176.mlab.com:57176/card-game', function(err, database) {
    if (err) return console.log(err);
    db = database;
    app.listen(3000, function(){
        console.log("Live at port 3000");
    });

});


app.use(bodyParser.urlencoded({extended: true}))


app.get("/",function(req,res){
    res.sendFile(path + "index.html");
});

app.get("/signup-page",function(req,res){
    res.sendFile(path + "signup.html");
});

app.get("/login-page",function(req,res){
    res.sendFile(path + "login.html");
});

app.get("/about-page",function(req,res){
    res.sendFile(path + "about.html");
});

app.post("/signup", function(req, res){
    console.log(req.body);
    db.collection('users').save({
        'username': req.body.username,
        'email': req.body.email,
        'password': req.body.password
    }, function(err, result) {
        if (err) return console.log(err);

        console.log('saved to database');
        res.redirect('/');
    })
});

app.post("/login", function (req, res) {
    console.log(req.body);
    var results = []
    db.collection('users').find({"email": req.body.email, "password": req.body.password}).toArray(function(err, results){
        console.log(results);
    });
    if (results.length == 0){
        
    }

});
