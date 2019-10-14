// import { connect } from "tls";

// import { eventNames } from "cluster";

// import { userInfo } from "os";

// import { userInfo } from "os";
//these components should ave been in app.js instead of index.js
// initialize modules
require('dotenv').config();
const mustache = require('mustache');
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
var flash = require('connect-flash');
var request = require('express-session');
var path = require('path');

// initialize components
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(session({secret: 'keyboard cat'}));
app.use(bodyParser());
app.set('view engine', 'pug');
app.set('view options', {layout: false});
require('./lib/routes.js')(app);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('app listening on port ' + port))

// load templates
const homepageTemplate = fs.readFileSync('./templates/homepage.html', 'utf8')



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

passport.deserializeUser(function(obj, cb){
    cb(null, obj);
});
// passport.deserializeUser(function(id, cb) {
//     User.findById(id, function(err, user) {
//       cb(err, user);
//     });
//   });

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
