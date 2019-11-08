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
// initialize server, passport, and express session
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
    // create variables that will be passed to HTML
    let userDetails
    const checkingTransactions = []
    const savingsTransactions = []
    let checkingHTML = ''
    let savingsHTML = ''
    getBalances(req.user.id)
      // after getting the users balances, the result is set to the userDetails object
      .then((bal) => {
        console.log(bal)
        userDetails = {
          chkBal: bal[0].checkingBal,
          savBal: bal[0].savingsBal,
          acctId: bal[0].id
        }
        return userDetails
      })
      // the user acctId is used to get their transactions
      .then((userDetails) => {
        return getTransactions(userDetails.acctId)
      })
      // transactions are pushed to an array
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
        // the transactions are formatted into HTML in the render functions
        checkingHTML = checkingTransactions.map(renderChecking).join('')
        savingsHTML = savingsTransactions.map(renderSavings).join('')
      })
      // now that all the data has been gathered, it can be sent to the browser
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
      console.log(result.rows)

      if (result.rows.length >= 1) {
        res.send('There is already a user with this email! <a <h1 href="/">Go Home</a></h1>')
      } else {
        addUser(req.body)
          .then(function () {
            createNewUserData(bodyEmail)
            res.send('<h1 style="text-align: center; padding: 50px">New User Successfully Created <br> <a <h1 style="text-align: center; padding: 50px" href="/">Go Home</a></h1> ')
          })
          .catch(function () {
            res.status(500).send('something went wrong. waaah, waaah <a<h1 href="/">Go Home</a></h1>')
          })
      }
    })
})
app.post('/moneysent', (req, res, next) => {
  const errors = validationResult(req)
  let flag = 0
  if (!errors.isEmpty()) {
    flag++
    return res.status(422).json({ errors: errors.array() })
  } else if (isNaN(req.body.amount)) {
    flag++
    return res.end('Oops! That is not a number.')
  } else if (req.body.amount === '') {
    flag++
    return res.end("Oops! You didn't enter an amount.")
  } else if (req.body.amount < 0) {
    flag++
    return res.end("Oops! You can't send negative money! Nice try!")
  }

  // create variables that will be passed to HTML
  const checkingTransactions = []
  const savingsTransactions = []
  let checkingHTML = ''
  let savingsHTML = ''
  let userDetails

  findUser(req.body.email)
    .then((results) => {
      if (results.rows.length < 1) {
        flag++
        return res.end('User not found!')
      }
    })
    .then(() => {
      return getBalances(req.session.passport.user.id)
    })
    .then((bal) => {
      // after getting the users balances, the result is set to the userDetails object
      console.log(bal)
      userDetails = {
        chkBal: bal[0].checkingBal,
        savBal: bal[0].savingsBal,
        acctId: bal[0].id
      }
      if ((userDetails.chkBal - req.body.amount) < 0) {
        flag++
        return res.end("Oops! Your checking account doesn't have enough cash to send that amount!")
      }
    })
    .then(() => {
      if (flag === 0) {
        // sender balance is updated based on user input
        return updateSenderBalance(req.session.passport.user.email, req.body.amount, req.body.email)
      } else {
        flag++
        return res.end('An error occured')
      }
    })
    .then(() => {
      if (flag === 0) {
        // amount is sent to designated user
        return sendMoney(req.body.email, req.body.amount, req.session.passport.user.email)
      } else {
        flag++
        return res.end('An error occured')
      }
    })
    // new user balance is retrieved
    .then(() => {
      if (flag === 0) {
        return getBalances(req.session.passport.user.id)
      } else {
        flag++
        return res.end('An error occured')
      }
    })
    .then((bal) => {
    // after getting the users balances, the result is set to the userDetails object
      userDetails = {
        chkBal: bal[0].checkingBal,
        savBal: bal[0].savingsBal,
        acctId: bal[0].id
      }
      return userDetails
    })
    .then((userDetails) => {
      // the user acctId is used to get their transactions
      return getTransactions(userDetails.acctId)
    })
    .then((transactions) => {
      // transactions are pushed to an array
      console.log('finished checking for transactions')
      transactions.forEach(element => {
        if (element.accountType === 'Checking') {
          checkingTransactions.push(element)
        } else {
          savingsTransactions.push(element)
        }
      })
      // the transactions are formatted into HTML in the render functions
      checkingHTML = checkingTransactions.map(renderChecking).join('')
      savingsHTML = savingsTransactions.map(renderSavings).join('')
    })
    .then(() => {
      // now that all the data has been gathered, it can be sent to the browser
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
      res.send(mustache.render(moneySentTemplate, {
        firstName: req.session.passport.user.firstName,
        checkingBalance: 'Error loading accounts',
        savingsBalance: 'Error loading accounts'
      }))
    })
})

// logout button triggers this route, destroying the session
app.get('/logout', function (req, res) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err)
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
