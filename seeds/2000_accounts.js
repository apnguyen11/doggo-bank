
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('Accounts').del()
    .then(function () {
      // Inserts seed entries
      return knex('Accounts').insert([
        {
          checking: 29560,
          savings: 41767,
          checkingBal: 427.59,
          savingsBal: 168.21
        },
        {
          checking: 12275,
          savings: 70013,
          checkingBal: 403.99,
          savingsBal: 925.21
        },
        {
          checking: 566,
          savings: 49767,
          checkingBal: 307.51,
          savingsBal: 338.10
        },
        {
          checking: 27759,
          savings: 24875,
          checkingBal: 108.06,
          savingsBal: 167.23
        },
        {
          checking: 33569,
          savings: 37094,
          checkingBal: 646.39,
          savingsBal: 276.23
        },
        {
          checking: 42044,
          savings: 7947,
          checkingBal: 951.98,
          savingsBal: 16.73
        },
        {
          checking: 33124,
          savings: 5274,
          checkingBal: 715.78,
          savingsBal: 685.92
        },
        {
          checking: 7796,
          savings: 91589,
          checkingBal: 471.47,
          savingsBal: 728.39
        },
        {
          checking: 29505,
          savings: 12689,
          checkingBal: 534.29,
          savingsBal: 557.86
        },
        {
          checking: 22582,
          savings: 49189,
          checkingBal: 531.20,
          savingsBal: 730.65
        }
      ]);
    });
};