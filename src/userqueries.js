const knex = require("knex");

function getUserBalance (user) {
  console.log("trying to log the username: " + user)
}

module.exports = {
  getUserBalance: getUserBalance
}