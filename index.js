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
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const session = require('express-session')
const { check, validationResult } = require('express-validator')

// const environment = process.env.NODE_ENV || 'development'
// const dbConfigs = require('./knexfile.js')
// const db = require('knex')(dbConfigs.development)

// import local modules
const {
  addUser,
  findUser,
  findUserByEmail,
  getBalances,
  getTransactions,
  renderChecking,
  renderSavings,
  createNewUserData,
  sendMoney,
  updateSenderBalance
  // createNewUserTransactions
} = require('./src/user-functions.js')

// initialize server
app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use(session({
  secret: 'keyboard cat'
}))

const port = process.env.PORT || 3000

// load templates
const homepageTemplate = fs.readFileSync('./templates/homepage.html', 'utf8')
const createUser = fs.readFileSync('./templates/createUser.html', 'utf8')
const moneySentTemplate = fs.readFileSync('./templates/moneysent.html', 'utf8')

// login page
app.get('/', (req, res) => res.sendFile('auth.html', { root: __dirname }))
app.get('/success', (req, res) => res.send('You successfully logged in'))
app.get('/error', (req, res) => res.send('Username or password is incorrect'))

passport.serializeUser(function (user, cb) {
  cb(null, user)
})

function createLogin (req, res, next) {
  res.send(createUser)
}
app.get('/createLogin', createLogin)

passport.deserializeUser(function (id, cb) {
  User.findById(id, function (err, user) {
    cb(err, user)
  })
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
      var comparison = bcrypt.compareSync(password, mappedPassword[0])
      console.log(comparison, 'if true bcrypt password is verified')
      // console.log(mappedPassword[0], password)
      if (user && mappedPassword[0] === password) {
        return done(null, user)
      } else if (user && comparison) {
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
    let userDetails
    const checkingTransactions = []
    const savingsTransactions = []
    let checkingHTML = ''
    let savingsHTML = ''

    getBalances(req.user.id)
      .then((bal) => {
        console.log(bal)
        userDetails = {
          chkBal: bal[0].checkingBal,
          savBal: bal[0].savingsBal,
          acctId: bal[0].id
        }
        return userDetails
      })
      .then((userDetails) => {
        return getTransactions(userDetails.acctId)
      })
      .then((transactions) => {
        console.log('finished checking for transactions')
        // console.log(transactions)
        transactions.forEach(element => {
          if (element.accountType === 'Checking') {
            checkingTransactions.push(element)
          } else {
            savingsTransactions.push(element)
          }
        })
        checkingHTML = checkingTransactions.map(renderChecking).join('')
        savingsHTML = savingsTransactions.map(renderSavings).join('')
      })
      .then(() => {
        res.send(mustache.render(homepageTemplate, {
          firstName: req.user.firstName,
          checkingBalance: '$' + userDetails.chkBal,
          savingsBalance: '$' + userDetails.savBal,
          listOfCheckingTransactions: checkingHTML,
          listOfSavingsTransactions: savingsHTML
        }))
      })
      .catch((err) => {
        console.log(err)
        res.send(mustache.render(homepageTemplate, {
          firstName: req.user.firstName,
          checkingBalance: 'Error loading accounts',
          savingsBalance: 'Error loading accounts'
        }))
      })
  }
)

app.post('/createUser', [
  // username must be an email
  check('email').isEmail(),
  // password must be at least 5 chars long
  check('password').isLength({ min: 5 })
], function (req, res, next) {
  // console.log(req.body, 'xoxoxoxoxoxoxox')
  var bodyEmail = req.body.email
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  findUser(req.body.email)
    .then((result) => {
      console.log(result)
      if (result.rows.length > 1) {
        res.send('There is already a user with this email!')
      } else {
        addUser(req.body)
          .then(function () {
            createNewUserData(bodyEmail)
            res.send('<h1 style="text-align: center; padding: 50px">New User Successfully Created <br> <a <h1 style="text-align: center; padding: 50px" href="/">Go Home</a></h1> ')
          })
          .catch(function () {
            res.status(500).send('something went wrong. waaah, waaah')
          })
      }
    })
})


app.post('/moneysent', (req, res, next) => {
  // console.log(req.body)
  // console.log('send money to: ' + req.body.email)
  // console.log('amount: ' + req.body.amount)
  // console.log(req.session)
  if (isNaN(req.body.amount)) {
    return res.send('Oops! That is not a number.')
  } else if (req.body.amount === '') {
    return res.send("Oops! You didn't enter an amount.")
  }
  let userDetails
  const checkingTransactions = []
  const savingsTransactions = []
  let checkingHTML = ''
  let savingsHTML = ''
  // console.log(req.session)

  updateSenderBalance(req.session.passport.user.email, req.body.amount, req.body.email)
    .then(() => {
      return sendMoney(req.body.email, req.body.amount, req.session.passport.user.email)
    })
    .then(() => {
      return getBalances(req.session.passport.user.id)
    })
    .then((bal) => {
      userDetails = {
        chkBal: bal[0].checkingBal,
        savBal: bal[0].savingsBal,
        acctId: bal[0].id
      }
      return userDetails
    })
    .then((userDetails) => {
      return getTransactions(userDetails.acctId)
    })
    .then((transactions) => {
      console.log('finished checking for transactions')
      transactions.forEach(element => {
        if (element.accountType === 'Checking') {
          checkingTransactions.push(element)
        } else {
          savingsTransactions.push(element)
        }
      })
      checkingHTML = checkingTransactions.map(renderChecking).join('')
      savingsHTML = savingsTransactions.map(renderSavings).join('')
    })
    .then(() => {
      res.send(mustache.render(moneySentTemplate, {
        firstName: req.session.passport.user.firstName,
        amountSent: req.body.amount,
        payee: req.body.email,
        checkingBalance: '$' + userDetails.chkBal,
        savingsBalance: '$' + userDetails.savBal,
        listOfCheckingTransactions: checkingHTML,
        listOfSavingsTransactions: savingsHTML
      }))
    })
    .catch((err) => {
      console.log(err)
      res.send(mustache.render(homepageTemplate, {
        firstName: req.session.passport.user.firstName,
        checkingBalance: 'Error loading accounts',
        savingsBalance: 'Error loading accounts'
      }))
    })
})
app.get('/logout', function (req, res) {

  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next (err)
      } else {
        return res.redirect('/')
      }
    })
  }
  // req.logout();
  // res.redirect('/')
})

app.listen(port, () => {
  console.log('app listening on port ' + port)
})
