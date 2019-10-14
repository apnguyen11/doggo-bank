// dependencies
var express = require('express');
var app = express();
var passport = require('passport');
var request = require('request');
const {Pool, Client} = require('pg');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');