"use strict";

var util = require('util');

// Declare expressJS
var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var port = 8001;

// Configure expressJS
app.set('views', __dirname + '/views');
app.set('view engine', "ejs");
app.use(express.static(__dirname + '/assets'));
app.use(bodyParser.urlencoded({ extended: true }));

// Add authentification for the Admin panel
var basicAuth = require('basic-auth');
var username = 'admin';
var userpass = 'citizen';

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };
  
  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === username && user.pass === userpass) {
    return next();
  } else {
    return unauthorized(res);
  };
};

// Database
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./citizen.db');

// Add Socket.IO ad launch the server
var sock;
var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

//Configue GPIO with 2 buttons
var GPIO = require('onoff').Gpio;
var yes = new GPIO(18, 'in', 'falling');
var no = new GPIO(17, 'in', 'falling');

// Route for Question (Front)
app.get('/', function(req, res) {
	db.get("SELECT MAX(id) FROM questions", function(err,row){
		var lastRow = row["MAX(id)"];
		if (err) throw err;
		db.get("SELECT title FROM questions WHERE id="+lastRow, function(error, row) {
			if (error) throw error;
			res.render('index.ejs', {"question": row.title});
		});
	});
});

// Route for Admin (Back)
app.get('/admin', auth, function(req, res) {
	db.all("SELECT * FROM questions ORDER BY id DESC", function(error, rows) {
		if (error) throw error;
		res.render('admin.ejs', {"questions": rows});
	});
});

// Route for posting a new question
app.post('/post_question', function(req, res) {
	console.log(req.body.inputQuestion);
	db.run("INSERT INTO questions(title, nbYes, nbNo) VALUES (\""+req.body.inputQuestion+"\",0,0)");
	res.redirect("/admin");
});

// Watch buttons states and lock var for xx seconds
var lock = 0;

yes.watch(function(err, state) {
	if((state == 1) && (lock == 0)) {
		lock = 1;
		console.log('YES vote & LOCKED');
		db.get("SELECT MAX(id) FROM questions", function(err,row){
			var lastRow = row["MAX(id)"];
			if (err) throw err;
			db.get("SELECT * FROM questions WHERE id="+lastRow,function(err,row){
				if (err) throw err;
				db.run("UPDATE questions SET nbYes="+(row.nbYes+1)+" WHERE id="+row.id, function(err) {
					if (err) throw err;
					if (sock) {
						sock.emit('vote');
					};
				});
			});
		});
	}
});

no.watch(function(err, state) {
	if((state == 1) && (lock == 0)) {
		console.log('YES vote & LOCKED');
		lock = 1;
		db.get("SELECT MAX(id) FROM questions", function(err,row){
			var lastRow = row["MAX(id)"];
			if (err) throw err;
			db.get("SELECT * FROM questions WHERE id="+lastRow,function(err,row){
				if (err) throw err;
				db.run("UPDATE questions SET nbNo="+(row.nbNo+1)+" WHERE id="+row.id, function(err) {
					if (err) throw err;
					if (sock) {
						sock.emit('vote');
					};
				});
			});
		});
	}
});
 
io.on('connection', function(socket) {
	sock = socket;
	socket.on('unvote', function (data) {
		console.log('UNLOCK');
		lock = 0;
	});
});
 
