
exports.up = function (knex) {
  return knex.schema.createTable('Users', (table) => {
    table.increments('id')
    table.string('firstName')
    table.string('lastName')
    table.string('address')
    table.string('city')
    table.string('state')
    table.string('zip')
    table.string('email')
    table.string('password')
  })
    .then(() => {
      return knex.schema.createTable('Accounts', (table) => {
        table.increments('id')
        table.integer('checking')
        table.integer('savings')
        table.float('checkingBal')
        table.float('savingsBal')
        table.integer('userId')
        table.foreign('userId').references('id').inTable('Users')
      })
    })
    .then(() => {
      return knex.schema.createTable('Transactions', (table) => {
        table.increments('id')
        table.datetime('timestamp')
        table.string('company')
        table.float('amount')
        table.string('accountType')
        table.integer('accountId')
        table.foreign('accountId').references('id').inTable('Accounts')
      })
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('Transactions')
    .then(() => {
      return knex.schema.dropTable('Accounts')
    })
    .then(() => {
      return knex.schema.dropTable('Users')
    })
}
