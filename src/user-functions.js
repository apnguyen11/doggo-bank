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

function createNewUserData(email){


     db.select('id').from("Users").where('email', email).then((results) => {
    
        return db('Accounts').insert(
          {checking: faker.random.number(),
            savings: faker.random.number(),
            checkingBal: faker.finance.amount(),
            savingsBal: faker.finance.amount(),
            userId: results[0].id},
        )
      })

      db.select('id').from("Users").where('email', email)
      .then((results) => {
        db.select('id').from('Accounts').where('userId', results[0].id)
          .then((results) => {
            // console.log(results[0].id)
            return db('Transactions').insert(
              [
                {
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
                }
              ]
            )
          })

      })

      
     
    

//   var newAccountIds = db.from("Accounts").select('id').where('userId', newUserId[0])

//  [
//     {
//       timestamp: faker.date.past(),
//       company: faker.company.companyName(),
//       amount: faker.finance.amount(),
//       accountId: faker.random.arrayElement(newAccountIds),
//       accountType: 'Checking'
//     },
//     {
//       timestamp: faker.date.past(),
//       company: faker.company.companyName(),
//       amount: faker.finance.amount(),
//       accountId: faker.random.arrayElement(newAccountIds),
//       accountType: 'Savings'
//     }
// ]

// db.select('Transactions').insert(newUserTransactions)

}



module.exports = {
  getBalances: getBalances,
  addUser: addUser,
  findUser: findUser,
  findUserByEmail: findUserByEmail,
  createNewUserData: createNewUserData,
  getTransactions: getTransactions,
  renderChecking: renderChecking,
  renderSavings: renderSavings
}
