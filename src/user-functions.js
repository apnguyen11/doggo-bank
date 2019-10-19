const dbConfigs = require('../knexfile.js')
const db = require('knex')(dbConfigs.development)
const bcrypt = require('bcrypt')
const saltRounds = 10
const faker = require('faker')


// get the balance of the user checking account
function getCheckingBalance (userId) {
  return db.select('checkingBal').from('Accounts').leftJoin('Users', 'Accounts.userId', 'Users.id')
    .where({
      'Accounts.userId': userId
    })
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
  
  var newUserId;
  // newUserId.push(db.select('id')
  // .from("Users")
  // .where({'email': email}))
  db.select('id').from("Users").where('email', email).then((results) => { results })
  
  var newUserAccount = {
      checking: faker.random.number(),
      savings: faker.random.number(),
      checkingBal: faker.finance.amount(),
      savingsBal: faker.finance.amount(),
      userId: newUserId[0]
  }

  db('Accounts').insert(newUserAccount)

  var newAccountIds = db.from("Accounts").select('id').where('userId', newUserId[0])

  var newUserTransactions = [
    {
      timestamp: faker.date.past(),
      company: faker.company.companyName(),
      amount: faker.finance.amount(),
      accountId: faker.random.arrayElement(newAccountIds),
      accountType: 'Checking'
    },
    {
      timestamp: faker.date.past(),
      company: faker.company.companyName(),
      amount: faker.finance.amount(),
      accountId: faker.random.arrayElement(newAccountIds),
      accountType: 'Savings'
    }
]

db.select('Transactions').insert(newUserTransactions)

}



module.exports = {
  getCheckingBalance: getCheckingBalance,
  addUser: addUser,
  findUser: findUser,
  findUserByEmail: findUserByEmail,
  createNewUserData: createNewUserData
}
