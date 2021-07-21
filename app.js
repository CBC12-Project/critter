const express = require('express');
const app = express();
const mysql = require('mysql');
require('dotenv').config();

app.use( express.static('static') );
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
        res.render('index')
})

var connection = mysql.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : 'critter',
        port: 3306
});
connection.connect();

app.listen( process.env.PORT || 8080);