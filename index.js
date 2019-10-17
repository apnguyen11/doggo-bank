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
const LocalStrategy = require('passport-local').Strategy;



const environment = process.env.NODE_ENV || 'development';
const dbConfigs = require('./knexfile.js');
const knex = require('knex')('development');
const db = require('knex')(dbConfigs.development)

var createError = require('http-errors');
var path = require('path');
var cookieParser = ('cookie-parser');
var logger = require('morgan');

// initialize server

app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
const port = process.env.PORT || 3000;
app.use(express.static(__dirname));


// load templates
const homepageTemplate = fs.readFileSync('./templates/homepage.mustache', 'utf8')
const createUser = fs.readFileSync('./templates/createUser.html', 'utf8')




// load the homepage 
app.get('/homepage', (req, res) => {
    res.send(homepageTemplate)
})


// login page
app.get('/', (req, res) => res.sendFile('auth.html', {root: __dirname}));
app.get('/success', (req, res) => res.send('You successfully logged in'));
app.get('/error', (req, res) => res.send('Username or password is incorrect'));

passport.serializeUser(function(user, cb){
    cb(null, user);
});

function createLogin(req, res, next){
    res.send(createUser)
}
app.get('/createLogin', createLogin)


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

app.get('/auth/facebook',
    passport.authenticate('facebook', {scope: 'email'}));


passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'name', 'gender', 'profileUrl', 'emails', 'photos']
}, function(accessToken, refreshToken, profile, cb){
    // console.log(profile, '-----------------')
    findUser('Pete47@gmail.com')
    .then(function(results){
        // console.log(results.rows)
        if(results.rows.length !== 0){
            // console.log('user exists')
            throw null
            return result
        } else {

        }
    })

    return cb(null, profile);
  }
));


function findUser(email) {
   
    return db.raw('SELECT * FROM "Users" WHERE email = ?', [email])
  
};

// function createUser(user){
//     return db.raw('INSERT INTO Users (firstName, lastName, address, city, state, zip, email)' [user.firstName, user.lastName, user.address, user.city, user.state, user.zip, user.email])
  
// }

app.get('/auth/facebook',
    passport.authenticate('facebook'));



app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/error'}),
    function(req, res, next){
            res.redirect('/homepage');
    });


//knex search query
function findUserByEmail(email){
    return db.raw('SELECT * FROM "Users" WHERE email = ?', [email])
}





// Passport Local Setup
const strategy = new LocalStrategy({
    username: 'email'
  },
  function(email, password, done) {
    findUserByEmail(email)
      .then(function(result) {
          console.log(result.rows, '-------------')
          var user = result.rows[0];
          var mappedPassword = result.rows.map(function(rows){
            return rows.password
        })
        console.log(mappedPassword[0], password)
        if (user && mappedPassword[0] === password) {
          return done(null, user);
        } else {
            console.log('not right user')
          return done(null, false);
        }
      })
      .catch(function(err) {
        console.log('findUserByEmail err:', err);
        return done(err);
      });
    }
);

passport.use(strategy);

  app.post('/',
  passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
        res.redirect('/homepage');
  });

  //create user

  app.post('/createUser')

  app.listen(port, () => {
    console.log('app listening on port ' + port)
  
});