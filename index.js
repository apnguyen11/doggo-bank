// initialize modules
const mustache = require('mustache')
const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')

// initialize server
const port = 3000
app.listen(port, () => console.log('app listening on port ' + port))

// load templates
const homepageTemplate = fs.readFileSync('./templates/homepage.mustache', 'utf8')

// load the homepage 
app.get('/', (req, res) => {
    res.send(homepageTemplate)
})