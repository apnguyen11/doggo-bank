// import { connect } from "tls";

// import { eventNames } from "cluster";

// import { userInfo } from "os";

// import { userInfo } from "os";

// initialize modules
require('dotenv').config();
const mustache = require('mustache');
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
mongoose.connect('mongodb://localhost/DoggoDatabase');

// initialize server
const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String
});
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('app listening on port ' + port))

// load templates
const homepageTemplate = fs.readFileSync('./templates/homepage.mustache', 'utf8')

// load the homepage 
app.get('/homepage', (req, res) => {
    res.send(homepageTemplate)
})

// login page
app.get('/', (req, res) => res.sendFile('auth.html', {root: __dirname}));
app.get('/success', (req, res) => res.send('You successfully logged in'));
app.get('/error', (req, res) => res.send('error logging in'));

passport.serializeUser(function(user, cb){
    cb(null, user);
});

// passport.deserializeUser(function(obj, cb){
//     cb(null, obj);
// });
passport.deserializeUser(function(id, cb) {
    User.findById(id, function(err, user) {
      cb(err, user);
    });
  });

const FacebookStrategy = require('passport-facebook').Strategy;

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;


passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback'
},
function(accessToken, refreshToken, profile, cb){
    return cb(null, profile);
}
));

app.get('/auth/facebook',
    passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/error'}),
    function(req, res){
        res.redirect('/homepage');
    });

// Passport Local Setup
passport.use(new LocalStrategy(
    function(username, password, done) {
        UserDetails.findOne({
          username: username
        }, function(err, user) {
          if (err) {
            return done(err);
          }
  
          if (!user) {
            return done(null, false);
          }
  
          if (user.password != password) {
            return done(null, false);
          }
          return done(null, user);
        });
    }
  ));

  app.post('/',
  passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/homepage');
  });
