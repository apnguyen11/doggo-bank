const faker = require('faker')
const numberOfUsers = 10
const numberOfTransactions = 100

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('Transactions').del()
    .then(() => {
      return knex('Accounts').del()
    })
    .then(() => {
      return knex('Users').del()
    })
    .then(() => {
      const users = []

      for (let i = 0; i < numberOfUsers; i++) {
        users.push({
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          address: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.stateAbbr(),
          zip: faker.address.zipCode(),
          email: faker.internet.email(),
          password: (faker.internet.password())
        })
      }
      return knex('Users').insert(users)
    })
    .then(() => {
      return knex('Users').pluck('id').then((userIds) => {
        const accounts = []

        for (let i = 0; i < numberOfUsers; i++) {
          accounts.push({
            checking: faker.random.number(),
            savings: faker.random.number(),
            checkingBal: faker.finance.amount(),
            savingsBal: faker.finance.amount(),
            userId: userIds[i]
          })
        }
        return knex('Accounts').insert(accounts)
      })
    })
    .then(() => {
      return knex('Accounts').pluck('id').then((accountIds) => {
        const transactions = []

        for (let i = 0; i < numberOfTransactions; i++) {
          transactions.push({
            timestamp: faker.date.past(),
            company: faker.company.companyName(),
            amount: faker.finance.amount(),
            accountId: faker.random.arrayElement(accountIds)
          })
        }
        return knex('Transactions').insert(transactions)
      })
    })
}
