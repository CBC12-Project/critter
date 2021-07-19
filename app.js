const express = require('express');
const app = express();
require('dotenv').config();

app.use( express.static('static') );
app.set('view engine', 'ejs');

app.listen( process.env.PORT || 8080);