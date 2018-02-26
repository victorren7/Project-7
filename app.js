'use strict'

const Twit = require('twit');
const express = require('express');
const moment = require('moment');
const config = require('./config');
const app = express();
const httpServer = require('http-server');
var T = new Twit({
  consumer_key:         'config.consumer_key',
  consumer_secret:      'config.consumer_secret',
  access_token:         'config.access_token',
  access_token_secret:  'config.access_token_secret'
});

app.use('/static', express.static('public'));

//an object to hold the data from twitter
var myTweetsArray = { tweets: {}, friends: {}, direct_messages: {}};

// Set up the pug and view engine
app.set('view engine', 'pug');

//Port: 3000
;
app.listen(3000);

//Timeliine
app.use((req, res, next) => {
  T.get('statuses/user_timeline', { count: 5 }, function (err, data, response) {
    req.timeline = data;
    next();
  });
});

//Following
app.use((req, res, next) => {
  T.get('friends/list', { count: 5 }, function (err, data, response) {
    req.friends = data;
    next();
  });
});

//DMs
app.use((req, res, next) => {
  T.get('direct_messages', { count: 5 }, function (err, data, response) {
    req.messages = data;
    next();
  });
});

//Verify and get user info
app.use((req, res, next) => {
  T.get('account/verify_credentials', { skip_status: true }, function(err, data, response) {
    req.user = data;
    console.log(data);
    next();
  });
});

//Root GET route
app.get('/', (req, res) => {
  const user = req.user;
  const timeline = req.timeline;
  const friends = req.friends;
  const messages = req.messages;
  const messages_sent = req.messages_sent;
  const background = req.background;
  res.render('layout', { user, timeline, friends, messages, background, moment });
});


app.post('/', (req, res) => {
  T.post('statuses/update', { status: req.body.tweet }, function(err, data, response) {
    console.log('You tweeted!');
  });
  res.redirect('/');
});

app.use((req, res, next) => {
  const err = new Error("Hmm... something went wrong.");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.error = err;
  res.render('error_page', err);
});


