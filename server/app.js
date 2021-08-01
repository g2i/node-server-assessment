const express = require('express');
const Database = require('database').Database;

const app = express();

const db = Database.createPreseededDatabase();

module.exports = app;
