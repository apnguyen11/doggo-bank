const faker = require('faker')
const fs = require('fs')

function generateUsers (numOfUsers) {
  var users = []
  let i = 0
  while (i < numOfUsers) {
    var user = {}
    user.firstName = faker.name.firstName()
    user.lastName = faker.name.lastName()
    user.address = faker.address.streetAddress()
    user.city = faker.address.city()
    user.state = faker.address.stateAbbr()
    user.zip = faker.address.zipCode()
    user.email = faker.internet.email()
    user.password = (faker.random.word() + faker.random.number())
    users.push(user)
    i++
  }
  fs.writeFile('users.json', JSON.stringify(users), (err) => {
    if (err) throw err
    console.log('Users saved!')
  })
}

function generateAccounts (numOfAccounts) {
  var accounts = []
  let i = 0
  while (i < numOfAccounts) {
    var account = {}
    account.checking = faker.random.number()
    account.savings = faker.random.number()
    account.balance = faker.finance.amount()
    accounts.push(account)
    i++
  }
  fs.writeFile('accounts.json', JSON.stringify(accounts), (err) => {
    if (err) throw err
    console.log('Accounts saved!')
  })
}

function generateTransactions (numOfTransactions) {
  var transactions = []
  let i = 0
  while (i < numOfTransactions) {
    var transaction = {}
    transaction.date = faker.date.past()
    transaction.company = faker.company.companyName()
    transaction.amount = faker.finance.amount()
    transactions.push(transaction)
    i++
  }
  fs.writeFile('transactions.json', JSON.stringify(transactions), (err) => {
    if (err) throw err
    console.log('Transactions saved!')
  })
}

generateUsers(10)
generateAccounts(10)
generateTransactions(100)
