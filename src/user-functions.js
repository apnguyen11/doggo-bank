const dbConfigs = require('../knexfile.js')
const db = require('knex')(dbConfigs.development)
const bcrypt = require('bcrypt')
const saltRounds = 10

// get the balance of the user checking account
function getBalances (userId) {
  return db.select('checkingBal', 'savingsBal', 'Accounts.id')
    .from('Accounts')
    .leftJoin('Users', 'Accounts.userId', 'Users.id')
    .where({
      'Accounts.userId': userId
    })
}

// get the transactions for a user
function getTransactions (accountId) {
  console.log('getting transactions for account id: ' + accountId)
  return db.select('timestamp', 'company', 'amount', 'accountType')
    .from('Transactions')
    .leftJoin('Accounts', 'Transactions.accountId', 'Accounts.id')
    .where({
      'Transactions.accountId': accountId
    })
}

function renderChecking (checkingArray) {
  return `
    <li>${checkingArray.timestamp} || ${checkingArray.company} || $${checkingArray.amount}</li>
  `
}

function renderSavings (savingsArray) {
  return `
    <li>${savingsArray.timestamp} || ${savingsArray.company} || $${savingsArray.amount}</li>
  `
}

// create user
function addUser (user) {
  var myPlaintextPassword = user.password
  var hash = bcrypt.hashSync(myPlaintextPassword, saltRounds)

  return db.raw(
    `INSERT into "Users"
      ("firstName", "lastName", address, city, state, zip, email, "password")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.firstName, user.lastName, user.address, user.city, user.state, user.zip, user.email, hash])
}

function findUser (email) {
  return db.raw('SELECT * FROM "Users" WHERE email = ?', [email])
}

function findUserByEmail (email) {
  return db.raw('SELECT * FROM "Users" WHERE email = ?', [email])
}

module.exports = {
  getBalances: getBalances,
  addUser: addUser,
  findUser: findUser,
  findUserByEmail: findUserByEmail,
  getTransactions: getTransactions,
  renderChecking: renderChecking,
  renderSavings: renderSavings
}
