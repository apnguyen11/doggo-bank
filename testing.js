// npm install faker
const faker = require('faker')
// fake users
var firstName = faker.name.firstName()
var lastName = faker.name.lastName()

var address = faker.address.streetAddress()
var city = faker.address.city()
var state = faker.address.stateAbbr()
var zip = faker.address.zipCode()

var randomEmail = faker.internet.email()
var num = faker.random.number()
var password = faker.random.word()
var checkingAccount = faker.random.number()
var savingAccount = faker.random.number()

var StartingBalance = faker.finance.amount()
var company = faker.company.companyName()
var transaction = faker.finance.amount()

var date = faker.date.past()


console.log(lastName)
console.log(firstName)

console.log(address)
console.log(city)
console.log(zip)
console.log(state)

console.log(randomEmail)
console.log(password + num)
console.log(checkingAccount)
console.log(savingAccount)
console.log(StartingBalance)

console.log(company)
console.log(transaction)

console.log(date)

// company name 
// starting balance
// transaction amount
// 