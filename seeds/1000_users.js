const fs = require('fs')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('Users').del()
    .then(function () {
      // Inserts seed entries
      return knex('Users').insert([
        {
          'firstName': 'Mariah',
          'lastName': 'Kuvalis',
          'address': '1200 Will Plains',
          'city': 'Kobyport',
          'state': 'AR',
          'zip': '62133',
          'email': 'Pete47@gmail.com',
          'password': 'Configurable41043'
        },
        {
          'firstName': 'Sebastian',
          'lastName': 'Quigley',
          'address': '5099 Jairo Branch',
          'city': 'Brownmouth',
          'state': 'IA',
          'zip': '15790',
          'email': 'Alf.Ziemann@gmail.com',
          'password': 'Togo1144'
        },
        {
          'firstName': 'Helmer',
          'lastName': 'Kris',
          'address': '5412 Flatley Expressway',
          'city': 'New Raleigh',
          'state': 'KS',
          'zip': '15222',
          'email': 'Adah_Jones@gmail.com',
          'password': 'CFP Franc40997'
        },
        {
          'firstName': 'Elva',
          'lastName': 'King',
          'address': '6004 Sanford Motorway',
          'city': 'West Cathrineburgh',
          'state': 'OR',
          'zip': '73780-0365',
          'email': 'Darby29@yahoo.com',
          'password': 'invoice68473'
        },
        {
          'firstName': 'Minerva',
          'lastName': 'Champlin',
          'address': '4354 Ernestina Bridge',
          'city': 'West Brendaton',
          'state': 'PA',
          'zip': '98312-1516',
          'email': 'Hayley_Brakus95@yahoo.com',
          'password': 'portals1894'
        },
        {
          'firstName': 'Laurel',
          'lastName': 'Wisozk',
          'address': '8229 Julius Springs',
          'city': 'Reynaburgh',
          'state': 'KS',
          'zip': '53687',
          'email': 'Lester.Von74@gmail.com',
          'password': 'Guinea Franc24111'
        },
        {
          'firstName': 'Eleazar',
          'lastName': 'Thiel',
          'address': '076 Niko Station',
          'city': 'Gregoryfurt',
          'state': 'SD',
          'zip': '43614',
          'email': 'Elwyn.Thiel@yahoo.com',
          'password': 'impactful2983'
        },
        {
          'firstName': 'Amparo',
          'lastName': 'Murphy',
          'address': '449 Flatley Vista',
          'city': 'North Alda',
          'state': 'VT',
          'zip': '03590-3796',
          'email': 'Laura76@hotmail.com',
          'password': 'calculate47144'
        },
        {
          'firstName': 'Duane',
          'lastName': 'Ondricka',
          'address': '893 Garland Parkway',
          'city': 'New Lester',
          'state': 'AK',
          'zip': '29878',
          'email': 'Leora97@yahoo.com',
          'password': 'tan69086'
        },
        {
          'firstName': 'Eloise',
          'lastName': 'Flatley',
          'address': '5052 Ledner Spurs',
          'city': 'Myleneville',
          'state': 'GA',
          'zip': '55071-0079',
          'email': 'Halie78@yahoo.com',
          'password': 'indigo96685'
        }
      ]);
    });
};
