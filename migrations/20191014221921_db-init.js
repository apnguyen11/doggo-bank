
exports.up = function(knex) {
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
  })})
};

exports.down = function(knex) {
  return knex.schema.dropTable('Users')
  .then(() => {
    return knex.schema.dropTable('Accounts')
  })
};
