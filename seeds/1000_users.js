const faker = require('faker')
const numberOfSeeds = 10

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('Users').del()
    .then(() => {
      return knex('Accounts').del()
    })
    .then(() => {
      const users = []

      for (let i = 0; i < numberOfSeeds; i++) {
        users.push({
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          address: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.stateAbbr(),
          zip: faker.address.zipCode(),
          email: faker.internet.email(),
          password: (faker.random.word() + faker.random.number())
        })
      }
      return knex('Users').insert(users)
    })
}

// .then(function () {
//   // Inserts seed entries
//   return knex('Accounts').insert({
//     checking: faker.random.number(),
//     savings: faker.random.number(),
//     checkingBal: faker.finance.amount(),
//     savingsBal: faker.finance.amount()
//   })
// })
// }
