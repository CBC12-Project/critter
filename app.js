const express = require('express');
const app = express();
const mysql = require('mysql');
require('dotenv').config();
app.use(express.urlencoded({extended:true}));

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

app.post('/create', (req, res) => {
        let currentUserId = 1;
        let createCrit = req.body.createCrit;
        let crit_query = `
        INSERT INTO crits 
                (id, user_id, crit_reply_id, message, created_on)
        VALUES
                (NULL, ?, NULL, ?, current_timestamp());
        `;
        connection.query(crit_query, [currentUserId.toString(), createCrit.toString()], function(err, res) {
                if (err) throw err;
        })
        let currentCrit;
        connection.query("SELECT `id` FROM `crits` ORDER BY id DESC LIMIT 1", (err, results) => {
                if (err) throw err;
                currentCrit = results[0].id;
                res.redirect(302, `crit/${currentCrit}`);
        });
})

const connection = mysql.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : 'critter',
        port     : process.env.DB_PORT
});
connection.connect();

app.listen( process.env.PORT || 8080);