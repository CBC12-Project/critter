const express = require('express');
const app = express();
const mysql = require('mysql');
require('dotenv').config();

app.use( express.static('static') );
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	// todo: render timeline
	res.render('index');
});

app.get('/crit/:crit_id', (req, res) => {
	let crit_query = `
		SELECT 
			crits.id, crits.user_id, users.display_name, 
			users.username, crits.crit_reply_id,
			crits.message, crits.created_on 
		FROM crits 
		LEFT JOIN users 
		ON crits.user_id = users.id 
		WHERE crits.id = ?;
	`;
	connection.query(crit_query, req.params.crit_id, (err, results) => {
		let crit = {
			user: {
				display_name: results[0].display_name,
				picture: '',
				username: '@' + results[0].username
			},
			crit: {
				id: results[0].id,
				created_on: results[0].created_on,
				likes: 0,
				replies: 0,
				message: results[0].message
			}
		};
		res.render('crit', crit);
	});
	
});

app.get('/search', (req, res) => {
    let searchParam = `%${req.query.search}%`;
	let search_query = `
    SELECT 
        crits.id, crits.user_id, users.display_name, 
        users.username, crits.crit_reply_id,
        crits.message, crits.created_on 
    FROM crits 
    LEFT JOIN users 
    ON crits.user_id = users.id 
    WHERE crits.message 
    lIKE ?`;
	connection.query(search_query, searchParam, (err, results) => {
		let crit_results = [];
		for(let i = 0; i < results.length; i++){
			crit_results.push({
				user: {
					display_name: results[i].display_name,
					picture: '',
					username: '@' + results[i].username
				},
				crit: {
					id: results[i].id,
					created_on: results[i].created_on,
					likes: 0,
					replies: 0,
					message: results[i].message
				}
			})
        }
		res.render('search', {crit_results:crit_results});
	});
	
});

const connection = mysql.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : 'critter',
        port     : process.env.DB_PORT
});
connection.connect();

app.listen( process.env.PORT || 8080);