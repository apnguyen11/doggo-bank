const dbConfigs = require('../knexfile.js')
const db = require('knex')(dbConfigs.development)
const bcrypt = require('bcrypt')
const saltRounds = 10
const faker = require('faker')

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
    .orderBy('timestamp', 'desc')
}

// this is ran on a transaction array to format for HTML
function renderChecking (checkingArray) {
  const formattedTimestamp = (checkingArray.timestamp).toLocaleString()
  return `
    <li>${formattedTimestamp} || ${checkingArray.company} || $${checkingArray.amount}</li>
  `
}

// this is ran on a transaction array to format for HTML
function renderSavings (savingsArray) {
  const formattedTimestamp = (savingsArray.timestamp).toLocaleString()
  return `
    <li>${formattedTimestamp} || ${savingsArray.company} || $${savingsArray.amount}</li>
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

function createNewUserData (email) {
  db.select('id').from('Users').where('email', email).then((results) => {
    return db('Accounts').insert({
      checking: faker.random.number(),
      savings: faker.random.number(),
      checkingBal: faker.finance.amount(),
      savingsBal: faker.finance.amount(),
      userId: results[0].id
    }
    )
  }).then(() => {
    db.select('id').from('Users').where('email', email)
      .then((results) => {
      // console.log(results, '0000000000')
        var userId = results[0].id
        db.select('id').from('Accounts').where('userId', userId)
          .then((results) => {
          // console.log(results[0].id)
          // console.log(results, 'xxxxxxxxxxxxx')
            return db('Transactions').insert(
              [{
                timestamp: faker.date.past(),
                company: faker.company.companyName(),
                amount: faker.finance.amount(),
                accountId: results[0].id,
                accountType: 'Checking'
              },
              {
                timestamp: faker.date.past(),
                company: faker.company.companyName(),
                amount: faker.finance.amount(),
                accountId: results[0].id,
                accountType: 'Savings'
              }]
            )
          })
      })
  })
}

// this is ran when user sends money to another user, updating the recipient's account balance
function sendMoney (payeeEmail, amount, senderEmail) {
  return db('Users').select('Users.id').where({ email: payeeEmail })
    .then(payeeId => {
      return db('Accounts').select('Accounts.checkingBal').where({ userId: payeeId[0].id })
        .then(oldBal => {
          // console.log('oldBal: ' + oldBal[0].checkingBal)
          const newBal = parseFloat(oldBal[0].checkingBal) + parseFloat(amount)
          // console.log('newBal: ' + newBal.toFixed(2))
          // console.log('payee: ' + payeeId[0].id)
          return db('Accounts').where({ userId: payeeId[0].id })
            .update({ checkingBal: newBal.toFixed(2) })
        })
        // new transaction added to recipient account
        .then(() => {
          return db('Transactions').insert({
            timestamp: new Date().toISOString(),
            company: senderEmail,
            amount: amount,
            accountType: 'Checking',
            accountId: payeeId[0].id
          })
        })
    })
}

// this updates the balance of the sender when sending money to another user
function updateSenderBalance (senderEmail, amount, payeeEmail) {
  return db('Users').select('Users.id').where({ email: senderEmail })
    .then(senderId => {
      return db('Accounts').select('Accounts.checkingBal').where({ userId: senderId[0].id })
        .then(oldBal => {
          const newBal = parseFloat(oldBal[0].checkingBal) - parseFloat(amount)
          return db('Accounts').where({ userId: senderId[0].id })
            .update({ checkingBal: newBal.toFixed(2) })
        })
        // add a transaction to the sender account
        .then(() => {
          return db('Transactions').insert({
            timestamp: new Date().toISOString(),
            company: payeeEmail,
            amount: (amount *= -1),
            accountType: 'Checking',
            accountId: senderId[0].id
          })
        })
    })
}

module.exports = {
  getBalances: getBalances,
  addUser: addUser,
  findUser: findUser,
  findUserByEmail: findUserByEmail,
  createNewUserData: createNewUserData,
  getTransactions: getTransactions,
  renderChecking: renderChecking,
  renderSavings: renderSavings,
  sendMoney: sendMoney,
  updateSenderBalance: updateSenderBalance
  // createNewUserTransactions: createNewUserTransactions
}
