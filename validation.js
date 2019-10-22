// init express
const express = require('express')
const app = express()


app.use(express.json())
app.post('/user', function(req,res){
  user.create({
    username: req.body.username,
    password: req.body.password
  }).then(user => res.json(user))
})

const { check validationResult } = requires('express-validator')

app.post('/user', [
// checking for username/email 
  check('username').isEmail(),

// checking for password
  check('password').isLength({min: 6 })
], function(req,res){
    const errors = validationResult(res)
// checking to make sure field is now empty
    if (!errors.isEmty()){
      return res.status(422).json({ errors: errors.array() })
    }
// come back to
    user.create({
      username: req.body.username,
      password: req.body.password
    }).then(user => res.json(user))
})

// make sure email is not already taken
const { body } = require('express-validator')

app.post('/user', body('email').custom(value => {
  retur User.findUserByEmail(value).then(user => {
    if(user){
      return Promise.reject('Email is already taken')
    }
  })
}), (req,res) => {
  // redirect to input field
})

// confirm that pass word matches
app.post('/user', body('passwordConfirmation').custom((value, { req }) => {
  if (value !== req.body.password){
    throw new Error('Password is invalid')
  }

  return true
}), (req,res)=> {
  // redirect to password field
}
})

// checking to see if password meets requirements
app.post('/user', [
  // cpome back to
  check('password')
    .isLength({ min: 6}).withMessage('Must be at least 6 charters long')
    // not sure if we want to add this just yet
    .matches(/\d/).withMessage('Must contain a number')
], (req,res) => {
  // redirect to input field
})
