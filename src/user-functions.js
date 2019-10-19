const dbConfigs = require('../knexfile.js')
const db = require('knex')(dbConfigs.development)
const bcrypt = require('bcrypt')
const saltRounds = 10;

// get the balance of the user checking account
function getCheckingBalance (userId) {
  return db.select('checkingBal').from('Accounts').leftJoin('Users', 'Accounts.userId', 'Users.id')
    .where({
      'Accounts.userId': userId
    })
}

//create user
function addUser(user){
  var myPlaintextPassword = user.password
  var hash = bcrypt.hashSync(myPlaintextPassword, saltRounds)

  return db.raw(
    `INSERT into "Users"
      ("firstName", "lastName", address, city, state, zip, email, "password")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.firstName, user.lastName, user.address, user.city, user.state, user.zip, user.email, hash])

}

function findUser(email) {
  return db.raw('SELECT * FROM "Users" WHERE email = ?', [email])

}

function findUserByEmail (email) {
  return db.raw('SELECT * FROM "Users" WHERE email = ?', [email])
}

module.exports = {
  getCheckingBalance: getCheckingBalance,
  addUser: addUser,
  findUser: findUser,
  findUserByEmail: findUserByEmail
}
