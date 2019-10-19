// import { connect } from "tls";

// import { eventNames } from "cluster";

// import { userInfo } from "os";

// import { userInfo } from "os";

// initialize modules
require('dotenv').config()
const mustache = require('mustache')
const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const environment = process.env.NODE_ENV || 'development'
const dbConfigs = require('./knexfile.js')
const db = require('knex')(dbConfigs.development)

var createError = require('http-errors')
var path = require('path')
var cookieParser = ('cookie-parser')
var logger = require('morgan')

// import local modules
const {getCheckingBalance, addUser, findUser, findUserByEmail} = require('./src/user-functions.js')

// initialize server
app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use(passport.session())
const port = process.env.PORT || 3000

// load templates
const homepageTemplate = fs.readFileSync('./templates/homepage.html', 'utf8')
const createUser = fs.readFileSync('./templates/createUser.html', 'utf8')

// login page
app.get('/', (req, res) => res.sendFile('auth.html', { root: __dirname }))
app.get('/success', (req, res) => res.send('You successfully logged in'))
app.get('/error', (req, res) => res.send('Username or password is incorrect'))

passport.serializeUser(function (user, cb) {
  cb(null, user)
})

function createLogin(req, res, next){
    res.send(createUser)
}
app.get('/createLogin', createLogin)

passport.deserializeUser(function(id, cb) {
    User.findById(id, function(err, user) {
      cb(err, user);
    });
  });

const FacebookStrategy = require('passport-facebook').Strategy
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET

app.get('/auth/facebook',
    passport.authenticate('facebook', {scope: 'email'}));

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'name', 'gender', 'profileUrl', 'emails', 'photos']
}, function(accessToken, refreshToken, profile, cb){
    findUser('Pete47@gmail.com')
    .then(function(results){
        if(results.rows.length !== 0){
            throw null
            return result
        } else {

        }
    })

    return cb(null, profile);
  }
));

app.get('/auth/facebook',
  passport.authenticate('facebook'))

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/error' }),
  function (req, res, next) {
    //     if(req.isAuthenticated()){
    //         next()
    //     } else {
    res.redirect('/homepage')
    // }
    // console.log( req._passport.instance.session)
  })

// Passport Local Setup
const strategy = new LocalStrategy({
  username: 'email'
  },

  function (email, password, done) {  
    findUserByEmail(email)
    .then(function (result) {
      // console.log(result.rows, '-------------')
      var user = result.rows[0]
      var mappedPassword = result.rows.map(function (rows) {
        return rows.password
      })
      var comparison = bcrypt.compareSync(password, mappedPassword[0]);
      console.log(comparison, 'if true bcrypt password is verified')
      // console.log(mappedPassword[0], password)
      if (user && mappedPassword[0] === password) {
        return done(null, user)
      } else if (user && comparison){
        return done(null, user)
      } else {
        return done(null, false)
      }
    })
    .catch(function (err) {
      console.log('findUserByEmail err:', err)
      return done(err)
    })
})

passport.use(strategy)

app.post('/',
  passport.authenticate('local', { failureRedirect: '/error' }),
  function (req, res) {
    console.log('username ' + req.user.email + ' logged in')

    getCheckingBalance(req.user.id)
    .then((bal) => {
    //   console.log(bal[0].checkingBal)
    console.log(bal)
      return bal[0].checkingBal
    }).then((chkBal) => {
      res.send(mustache.render(homepageTemplate, {
        firstName: req.user.firstName,
        checkingBalance: '$' +chkBal
      }))
    })
    .catch(() => {
      let noAccountFound = 'No account info found'

      res.send(mustache.render(homepageTemplate, {
        firstName: req.user.firstName,
        checkingBalance: noAccountFound
      }))
    })
  }
)

app.post('/createUser', function(req, res, next){
  addUser(req.body)
    .then(function(){
        console.log(req.body)
        res.send('hopefully we created your User ')
    })
    .catch(function () {
      res.status(500).send('something went wrong. waaah, waaah')
    })
})

app.listen(port, () => {
  console.log('app listening on port ' + port)
})
